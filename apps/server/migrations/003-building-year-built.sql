-- 003: when a building was built; NULL means unknown (existing rows have no year)
ALTER TABLE buildings ADD COLUMN year_built INTEGER
  CHECK (year_built IS NULL OR year_built BETWEEN 1800 AND 2100);
