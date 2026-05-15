<?php
header('Content-Type: application/json');

require_once 'conexao_database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) exit(json_encode(['error' => 'Input inválido']));

    $action = $input['action'] ?? 'select';
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $input['table']);
    $params = [];

    // Função para centralizar a construção de filtros (WHERE)
    function buildWhere($filters, &$params) {
        if (empty($filters)) return "";
        $sql = "";
        foreach ($filters as $filter) {
            $col = preg_replace('/[^a-zA-Z0-9_]/', '', $filter['column']);
            $op = $filter['operator'] ?? '=';
            $val = $filter['value'];

            if ($op === 'IN' && is_array($val)) {
                $placeholders = implode(', ', array_fill(0, count($val), '?'));
                $sql .= " AND `$col` IN ($placeholders)";
                foreach ($val as $v) $params[] = $v;
            } else {
                $sql .= " AND `$col` $op ?";
                $params[] = $val;
            }
        }
        return $sql;
    }

    // --- INSERT ---
    if ($action === 'insert') {
        $insertedIds = [];
        foreach ($input['insertData'] as $row) {
            $columns = array_keys($row);
            $safeCols = array_map(fn($c) => "`".preg_replace('/[^a-zA-Z0-9_]/', '', $c)."`", $columns);
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $sql = "INSERT INTO `$table` (" . implode(', ', $safeCols) . ") VALUES ($placeholders)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array_values($row));
            $insertedIds[] = $pdo->lastInsertId();
        }
        echo json_encode(['success' => true, 'ids' => $insertedIds]);
    }

    // --- DELETE ---
    else if ($action === 'delete') {
        if (empty($input['filters'])) exit(json_encode(['error' => 'Filtros obrigatórios']));
        $sql = "DELETE FROM `$table` WHERE 1=1" . buildWhere($input['filters'], $params);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true, 'affected_rows' => $stmt->rowCount()]);
    }

    // --- UPDATE ---
    else if ($action === 'update') {
        $setParts = [];
        foreach ($input['updateData'] as $column => $value) {
            $col = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
            $setParts[] = "`$col` = ?";
            $params[] = $value;
        }
        $sql = "UPDATE `$table` SET " . implode(', ', $setParts) . " WHERE 1=1" . buildWhere($input['filters'], $params);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true, 'affected_rows' => $stmt->rowCount()]);
    }

    // --- SELECT ---
    else if ($action === 'select') {
        $columns = ($input['columns'] !== '*') ? preg_replace('/[^a-zA-Z0-9_,]/', '', $input['columns']) : '*';
        $sql = "SELECT $columns FROM `$table` WHERE 1=1" . buildWhere($input['filters'], $params);

        if (!empty($input['groupBy'])) {
            $groupCol = preg_replace('/[^a-zA-Z0-9_]/', '', $input['groupBy']);
            $sql .= " GROUP BY `$groupCol` ";
        }

        if (!empty($input['orderBy'])) {
            $orderCol = preg_replace('/[^a-zA-Z0-9_]/', '', $input['orderBy']['column']);
            $direction = ($input['orderBy']['order'] === 'DESC') ? 'DESC' : 'ASC';
            $sql .= " ORDER BY `$orderCol` $direction";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>