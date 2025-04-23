-- Insert default categories
INSERT INTO "Category" ("id", "name", "isDefault", "teamId")
VALUES
  (gen_random_uuid(), 'IT Security', true, NULL),
  (gen_random_uuid(), 'Data Privacy', true, NULL),
  (gen_random_uuid(), 'Compliance', true, NULL);
