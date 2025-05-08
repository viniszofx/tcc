-- Disable foreign key checks for loading
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE `historic`;
TRUNCATE TABLE `items`;
TRUNCATE TABLE `member_comission`;
TRUNCATE TABLE `commission`;
TRUNCATE TABLE `government_employee`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `allowed_users`;
TRUNCATE TABLE `campus`;
TRUNCATE TABLE `orgs`;
TRUNCATE TABLE `upload_table`;

-- Insert organizations
INSERT INTO `orgs` (`id`, `name`, `description`) VALUES 
(UUID(), 'IFMS', 'Instituto Federal de Mato Grosso do Sul');

-- Insert campus
INSERT INTO `campus` (`id`, `name`, `description`, `image`, `cover`) VALUES 
(UUID(), 'Corumbá', 'Campus Corumbá', NULL, NULL),
(UUID(), 'Campo Grande', 'Campus Campo Grande', NULL, NULL);

-- Insert allowed users first (pre-authorized users)
INSERT INTO `allowed_users` (`id`, `name`, `email`, `phone`, `status`) VALUES 
(UUID(), 'Admin System', 'admin@ifms.edu.br', '67999999999', 1),
(UUID(), 'President User', 'president@ifms.edu.br', '67888888888', 1),
(UUID(), 'Inventory User', 'inventory@ifms.edu.br', '67777777777', 1),
(UUID(), 'Maria Silva', 'maria.silva@ifms.edu.br', '67999887766', 1),
(UUID(), 'João Santos', 'joao.santos@ifms.edu.br', '67998877665', 1),
(UUID(), 'Ana Oliveira', 'ana.oliveira@ifms.edu.br', '67999776655', 1),
(UUID(), 'Carlos Souza', 'carlos.souza@ifms.edu.br', '67998766554', 1);

-- Insert registered users
INSERT INTO
    `users` (
        `id`,
        `name`,
        `email`,
        `phone`,
        `password`,
        `allowed`,
        `provider`,
        `photo`,
        `create_at`,
        `update_at`
    )
VALUES (
        UUID(),
        'Admin System',
        'admin@ifms.edu.br',
        '67999999999',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyW',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'President User',
        'president@ifms.edu.br',
        '67888888888',
        '$2a$12$NcY3c2yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyX',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'Inventory User',
        'inventory@ifms.edu.br',
        '67777777777',
        '$2a$12$PQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyY',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'Maria Silva',
        'maria.silva@ifms.edu.br',
        '67999887766',
        '$2a$12$RRv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyZ',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'João Santos',
        'joao.santos@ifms.edu.br',
        '67998877665',
        '$2a$12$SSv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyA',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'Ana Oliveira',
        'ana.oliveira@ifms.edu.br',
        '67999776655',
        '$2a$12$TTv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyB',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    ),
    (
        UUID(),
        'Carlos Souza',
        'carlos.souza@ifms.edu.br',
        '67998766554',
        '$2a$12$UUv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdVtJn/KJJi4MyC',
        1,
        'email',
        NULL,
        NOW(),
        NOW()
    );
-- Create commission
INSERT INTO `commission` (`id`, `name`, `description`, `open_at`, `close_at`) VALUES
(UUID(), 'Comissão de Inventário 2025', 'Comissão responsável pelo inventário anual', '2025-01-01 00:00:00', '2025-12-31 23:59:59');

-- Create Campo Grande commission
INSERT INTO `commission` (`id`, `name`, `description`, `open_at`, `close_at`) VALUES
(UUID(), 'Comissão de Inventário CG 2025', 'Comissão responsável pelo inventário do Campus Campo Grande', '2025-01-01 00:00:00', '2025-12-31 23:59:59');

-- Link users to government_employee
INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`) 
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Campo Grande' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'maria.silva@ifms.edu.br' LIMIT 1),
       'SERVIDOR';

INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`)
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Corumbá' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'ana.oliveira@ifms.edu.br' LIMIT 1),
       'DOCENTE';

-- Link remaining users to government_employee
INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`)
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Campo Grande' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'joao.santos@ifms.edu.br' LIMIT 1),
       'ADMINISTRATIVO';

INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`)
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Corumbá' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'carlos.souza@ifms.edu.br' LIMIT 1),
       'SERVIDOR';

-- Link system users to their respective campuses
INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`)
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Campo Grande' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'president@ifms.edu.br' LIMIT 1),
       'SERVIDOR';

INSERT INTO `government_employee` (`id`, `org_id`, `campus_id`, `user_id`, `rule`)
SELECT UUID(),
       (SELECT `id` FROM `orgs` WHERE `name` = 'IFMS' LIMIT 1),
       (SELECT `id` FROM `campus` WHERE `name` = 'Corumbá' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'inventory@ifms.edu.br' LIMIT 1),
       'SERVIDOR';

-- Link users to commission
INSERT INTO `member_comission` (`id_user`, `id_commission`, `rule`)
SELECT 
    (SELECT `id` FROM `users` WHERE `email` = 'president@ifms.edu.br' LIMIT 1),
    (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
    'PRESIDENTE';

INSERT INTO `member_comission` (`id_user`, `id_commission`, `rule`)
SELECT 
    (SELECT `id` FROM `users` WHERE `email` = 'inventory@ifms.edu.br' LIMIT 1),
    (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
    'INVENTARIANTE';

-- Add more inventariantes to commissions
INSERT INTO `member_comission` (`id_user`, `id_commission`, `rule`)
SELECT 
    (SELECT `id` FROM `users` WHERE `email` = 'maria.silva@ifms.edu.br' LIMIT 1),
    (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário CG 2025' LIMIT 1),
    'INVENTARIANTE';

INSERT INTO `member_comission` (`id_user`, `id_commission`, `rule`)
SELECT 
    (SELECT `id` FROM `users` WHERE `email` = 'joao.santos@ifms.edu.br' LIMIT 1),
    (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário CG 2025' LIMIT 1),
    'INVENTARIANTE';

-- Add test items
INSERT INTO `items` (`id`, `NUMERO`, `STATUS`, `ED`, `DESCRICAO`, `ROTULOS`, 
    `RESPONSABILIDADE_ATUAL`, `SETOR_DO_RESPONSAVEL`, 
    `CAMPUS_DA_LOTACAO_DO_BEM`, `SALA`, `ESTADO_DE_CONSERVACAO`,
    `DESCRICAO_PRINCIPAL`, `MARCA_MODELO`, `create_at`, `update_at`, `observacoes`)
VALUES
(UUID(), '2025001', 'ATIVO', 'ED001', 'Computador Desktop', 'TI,COMPUTADOR', 
'Maria Silva', 'Laboratório de Informática', 
'Campo Grande', 'LAB 01', 'BOM',
'Computador Desktop Dell', 'Dell Optiplex 7090', NOW(), NOW(), 'Equipamento novo'),

(UUID(), '2025002', 'EM USO', 'ED002', 'Projetor Multimídia', 'MULTIMIDIA,PROJETOR', 
'Ana Oliveira', 'Sala de Aula', 
'Corumbá', 'SALA 102', 'REGULAR',
'Projetor Epson', 'Epson PowerLite S41+', NOW(), NOW(), 'Lâmpada com 50% de uso'),

(UUID(), '2025003', 'ATIVO', 'ED003', 'Mesa de Reunião', 'MOBILIARIO,ESCRITORIO', 
'João Santos', 'Setor Administrativo', 
'Campo Grande', 'SALA-ADM', 'BOM',
'Mesa Reunião 10 lugares', 'Marca Própria', NOW(), NOW(), 'Mobiliário novo'),

(UUID(), '2025004', 'BAIXA SOLICITADA', 'ED004', 'Ar Condicionado', 'CLIMATIZACAO', 
'Carlos Souza', 'Laboratório de Informática', 
'Corumbá', 'LAB-INFO', 'RUIM',
'Split 24000 BTUs', 'Elgin Eco', NOW(), NOW(), 'Necessita substituição');

-- Historical actions using correct ENUM values
INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025001' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'inventory@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'CREATE',  -- Only CREATE, UPDATE, DELETE are allowed
       'Item conferido e cadastrado no sistema',
       NOW();

INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025002' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'inventory@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'UPDATE',
       'Item verificado - necessita manutenção preventiva',
       NOW();

-- Add historic movements using correct action values
INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025003' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'joao.santos@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'UPDATE',
       'Confirmada localização e estado do item',
       NOW();

INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025004' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'carlos.souza@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'UPDATE',
       'Solicitação de baixa por defeito irreparável',
       NOW();

-- Add movements by inventariantes using correct action values
INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025001' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'maria.silva@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário CG 2025' LIMIT 1),
       'UPDATE',  -- Changed from 'MOVE' to 'UPDATE'
       'Item movido do LAB 01 para LAB 02 - Necessidade do setor',
       NOW();

INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025003' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'joao.santos@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário CG 2025' LIMIT 1),
       'UPDATE',
       'Mesa transferida para sala de reuniões principal',
       NOW();

-- Add more movements in Corumbá
INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025002' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'ana.oliveira@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'UPDATE',  -- Changed from 'MOVE' to 'UPDATE'
       'Projetor realocado para auditório',
       NOW();

INSERT INTO `historic` (`id`, `item_id`, `member_id`, `commission_id`, `action`, `description`, `update_at`)
SELECT UUID(),
       (SELECT `id` FROM `items` WHERE `NUMERO` = '2025004' LIMIT 1),
       (SELECT `id` FROM `users` WHERE `email` = 'carlos.souza@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       'UPDATE',
       'Equipamento movido para depósito aguardando baixa',
       NOW();

-- Add file upload record
INSERT INTO `upload_table` (`id`, `member_id`, `commission_id`, `href`, `create_at`)
SELECT UUID(),
       (SELECT `id` FROM `users` WHERE `email` = 'president@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       '/uploads/inventory_2025_initial.xlsx',
       NOW();

-- Add more upload records showing commission progress
INSERT INTO `upload_table` (`id`, `member_id`, `commission_id`, `href`, `create_at`)
SELECT UUID(),
       (SELECT `id` FROM `users` WHERE `email` = 'president@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário 2025' LIMIT 1),
       '/uploads/inventory_2025_update1.xlsx',
       NOW();

-- Add file uploads for Campo Grande commission
INSERT INTO `upload_table` (`id`, `member_id`, `commission_id`, `href`, `create_at`)
SELECT UUID(),
       (SELECT `id` FROM `users` WHERE `email` = 'joao.santos@ifms.edu.br' LIMIT 1),
       (SELECT `id` FROM `commission` WHERE `name` = 'Comissão de Inventário CG 2025' LIMIT 1),
       '/uploads/inventory_cg_2025_initial.xlsx',
       NOW();

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;