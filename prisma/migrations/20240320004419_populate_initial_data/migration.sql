-- Insert initial item types
INSERT INTO "ItemType" ("name") VALUES ('Armor'), ('Weapon');

-- Insert initial perks
INSERT INTO "Perk" ("name", "effect") VALUES
('Fire Resistance', 'Grants resistance against fire-based damage'),
('Lightning Resistance', 'Grants resistance against lightning-based damage'),
('Void Resistance', 'Grants resistance against void-based damage');
