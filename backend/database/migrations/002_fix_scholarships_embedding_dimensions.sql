-- Ensure the scholarships.embedding column has the correct vector dimensions,
-- then recreate the ivfflat index.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE scholarships
  ALTER COLUMN embedding TYPE vector(3072);

-- Note: 3072-dimensional vector indexes may be unsupported on this pgvector build.
-- The schema repair is still useful even without an index.
