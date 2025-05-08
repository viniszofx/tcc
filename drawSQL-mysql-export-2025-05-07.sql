CREATE TABLE `allowed_users`(
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NULL,
    `status` BOOLEAN NOT NULL DEFAULT '0',
    PRIMARY KEY(`id`)
);
CREATE TABLE `users`(
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL UNIQUE,
    `allowed` BOOLEAN NOT NULL DEFAULT '0',
    `provider` VARCHAR(255) NULL,
    `photo` VARCHAR(255) NULL,
    `create_at` TIMESTAMP NOT NULL,
    `update_at` TIMESTAMP NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `government_employee`(
    `id` CHAR(36) NOT NULL,
    `org_id` CHAR(36) NULL,
    `campus_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `rule` ENUM(
        'SERVIDOR',
        'ASSISTENTE',
        'ADMINISTRATIVO',
        'DOCENTE'
    ) NOT NULL DEFAULT 'SERVIDOR',
    PRIMARY KEY(`id`)
);
CREATE TABLE `orgs`(
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `campus`(
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NULL,
    `cover` VARCHAR(255) NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `commission`(
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `open_at` TIMESTAMP NOT NULL,
    `close_at` TIMESTAMP NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `member_comission`(
    `id_user` CHAR(36) NOT NULL,
    `id_commission` CHAR(36) NOT NULL,
    `rule` ENUM(
        'INVENTARIANTE',
        'SUPORTE',
        'PRESIDENTE'
    ) NOT NULL DEFAULT 'INVENTARIANTE',
    PRIMARY KEY(`id_user`, `id_commission`)
);

CREATE TABLE `items`(
    `id` CHAR(36) NOT NULL,
    `NUMERO` VARCHAR(255) NOT NULL,
    `STATUS` ENUM(
        'ATIVO',
        'INATIVO',
        'EM USO',
        'BAIXA SOLICITADA',
        'BAIXADO'
    ) NOT NULL DEFAULT 'ATIVO',
    `ED` VARCHAR(255) NOT NULL,
    `DESCRICAO` VARCHAR(255) NOT NULL,
    `ROTULOS` VARCHAR(255) NOT NULL,
    `RESPONSABILIDADE_ATUAL` VARCHAR(255) NOT NULL,
    `SETOR_DO_RESPONSAVEL` VARCHAR(255) NOT NULL,
    `CAMPUS_DA_LOTACAO_DO_BEM` VARCHAR(255) NOT NULL,
    `SALA` VARCHAR(255) NOT NULL,
    `ESTADO_DE_CONSERVACAO` ENUM(
        'NOVO',
        'BOM',
        'REGULAR',
        'RUIM',
        'INSERVIVEL'
    ) NOT NULL,
    `DESCRICAO_PRINCIPAL` VARCHAR(255) NOT NULL,
    `MARCA_MODELO` VARCHAR(255) NOT NULL,
    `create_at` TIMESTAMP NOT NULL,
    `update_at` TIMESTAMP NOT NULL,
    `observacoes` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `historic`(
    `id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `commission_id` CHAR(36) NOT NULL,
    `action` ENUM('UPDATE', 'CREATE', 'DELETE') NOT NULL DEFAULT 'UPDATE',
    `description` VARCHAR(255) NOT NULL,
    `update_at` TIMESTAMP NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `upload_table`(
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `commission_id` CHAR(36) NOT NULL,
    `href` VARCHAR(255) NOT NULL,
    `create_at` TIMESTAMP NOT NULL,
    PRIMARY KEY(`id`)
);

-- Safely disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Add all foreign key constraints in correct order
ALTER TABLE `member_comission`
    ADD CONSTRAINT `member_comission_user_id_foreign` 
    FOREIGN KEY (`id_user`) 
    REFERENCES `users` (`id`);

ALTER TABLE `member_comission`
    ADD CONSTRAINT `member_comission_commission_id_foreign` 
    FOREIGN KEY (`id_commission`) 
    REFERENCES `commission` (`id`);

ALTER TABLE `historic` 
    ADD CONSTRAINT `historic_member_commission_foreign` 
    FOREIGN KEY(`member_id`, `commission_id`) 
    REFERENCES `member_comission`(`id_user`, `id_commission`);

ALTER TABLE `historic` 
    ADD CONSTRAINT `historic_item_id_foreign` 
    FOREIGN KEY(`item_id`) 
    REFERENCES `items`(`id`);

ALTER TABLE `upload_table` 
    ADD CONSTRAINT `upload_table_commission_id_foreign` 
    FOREIGN KEY(`commission_id`) 
    REFERENCES `commission`(`id`);

ALTER TABLE `government_employee` 
    ADD CONSTRAINT `government_employee_org_id_foreign` 
    FOREIGN KEY(`org_id`) 
    REFERENCES `orgs`(`id`);

ALTER TABLE `government_employee` 
    ADD CONSTRAINT `government_employee_campus_id_foreign` 
    FOREIGN KEY(`campus_id`) 
    REFERENCES `campus`(`id`);

ALTER TABLE `government_employee` 
    ADD CONSTRAINT `government_employee_user_id_foreign` 
    FOREIGN KEY(`user_id`) 
    REFERENCES `users`(`id`);

ALTER TABLE `allowed_users` 
    ADD CONSTRAINT `allowed_users_user_id_foreign` 
    FOREIGN KEY(`user_id`) 
    REFERENCES `users`(`id`);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;