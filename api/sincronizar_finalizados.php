<?php
require_once 'conexao_database.php';

try {
    // 1. Marca tudo como finalizado 'S'
    $pdo->exec("UPDATE tempo_livre SET finalizado = 'S'");

    // 2. Volta para 'N' apenas os que possuem desafios pendentes
    // Isso é SQL puro e performático!
    $sql = "UPDATE tempo_livre t 
            SET t.finalizado = 'N' 
            WHERE t.id IN (
                SELECT DISTINCT id_tempo_livre 
                FROM tempo_livre_desafios 
                WHERE finalizado = 'N'
            )";
    
    $pdo->exec($sql);

    echo json_encode(['success' => true, 'message' => 'Sincronização completa!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}