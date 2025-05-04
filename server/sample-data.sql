-- Insert sample skills
INSERT INTO skills (id, name, description, category, created_at, updated_at)
VALUES
  ('1', 'Button Attachment', 'Techniques for attaching buttons to garments', 'Sewing', NOW(), NOW()),
  ('2', 'Collar Assembly', 'Methods for assembling and attaching collars', 'Sewing', NOW(), NOW()),
  ('3', 'Cutting Machine Operation', 'Operating cutting machines safely and efficiently', 'Cutting', NOW(), NOW()),
  ('4', 'Embroidery', 'Decorative needlework techniques', 'Finishing', NOW(), NOW()),
  ('5', 'Fabric Quality Control', 'Inspecting fabrics for defects and quality issues', 'Quality', NOW(), NOW()),
  ('6', 'Fabric Spreading', 'Techniques for spreading fabric for cutting', 'Cutting', NOW(), NOW()),
  ('7', 'Garment Dyeing', 'Methods for dyeing completed garments', 'Finishing', NOW(), NOW()),
  ('8', 'Garment Finishing', 'Final touches and finishing processes for garments', 'Finishing', NOW(), NOW()),
  ('9', 'Lockstitch Machine Operation', 'Operating lockstitch sewing machines', 'Sewing', NOW(), NOW()),
  ('10', 'Pattern Making', 'Creating and modifying garment patterns', 'Design', NOW(), NOW()),
  ('11', 'Sleeve Attachment', 'Techniques for attaching sleeves to garments', 'Sewing', NOW(), NOW()),
  ('12', 'Stitch Quality Inspection', 'Inspecting stitches for quality and consistency', 'Quality', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample user_skills
-- Note: You'll need to replace the user_id values with actual user IDs from your database
INSERT INTO user_skills (user_id, skill_id, proficiency_level, willing_to_mentor, is_certified, last_certified_date, is_training, created_at)
VALUES
  -- User 1 skills
  ('1', '9', 'expert', true, true, '2023-01-15', false, NOW()),
  ('1', '10', 'advanced', false, true, '2023-02-20', false, NOW()),
  ('1', '11', 'intermediate', false, false, NULL, true, NOW()),
  
  -- User 2 skills
  ('2', '9', 'expert', true, true, '2023-03-10', false, NOW()),
  ('2', '12', 'expert', true, true, '2023-01-05', false, NOW()),
  
  -- User 3 skills
  ('3', '6', 'advanced', true, true, '2023-02-15', false, NOW()),
  ('3', '7', 'intermediate', false, false, NULL, true, NOW()),
  
  -- User 4 skills
  ('4', '6', 'expert', true, true, '2023-01-20', false, NOW()),
  ('4', '8', 'advanced', false, true, '2023-03-05', false, NOW()),
  
  -- User 5 skills
  ('5', '10', 'expert', true, true, '2023-02-25', false, NOW()),
  ('5', '4', 'advanced', false, true, '2023-01-10', false, NOW()),
  
  -- User 6 skills
  ('6', '10', 'expert', true, true, '2023-03-15', false, NOW()),
  ('6', '2', 'intermediate', false, false, NULL, true, NOW()),
  
  -- User 7 skills
  ('7', '12', 'expert', true, true, '2023-02-10', false, NOW()),
  ('7', '5', 'advanced', false, true, '2023-01-25', false, NOW()),
  
  -- User 8 skills
  ('8', '12', 'expert', true, true, '2023-03-20', false, NOW()),
  ('8', '1', 'intermediate', false, false, NULL, true, NOW())
ON CONFLICT (user_id, skill_id) DO NOTHING;
