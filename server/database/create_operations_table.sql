-- Create operations table
DO $$
BEGIN
    -- Check if the operations table exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'operations'
    ) THEN
        -- Create UUID extension if it doesn't exist
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create operations table
        CREATE TABLE public.operations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            number TEXT NOT NULL,
            quality_checkpoints JSONB,
            smv_target DECIMAL(10, 2),
            sop_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add comment to the table
        COMMENT ON TABLE public.operations IS 'Stores manufacturing operations data';
        
        -- Create trigger function for updated_at
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger for operations table
        CREATE TRIGGER set_operations_timestamp
        BEFORE UPDATE ON public.operations
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
        
        -- Insert sample data
        INSERT INTO public.operations (name, number, quality_checkpoints, smv_target, sop_url)
        VALUES 
            ('Attach Collar', 'OP-001', '["Check seam alignment", "Verify stitch density", "Inspect for puckering"]', 2.5, 'https://example.com/sop/attach-collar'),
            ('Sew Side Seam', 'OP-002', '["Check seam straightness", "Verify stitch tension", "Inspect for skipped stitches"]', 1.8, 'https://example.com/sop/side-seam'),
            ('Attach Sleeve', 'OP-003', '["Check sleeve alignment", "Verify armhole shape", "Inspect for gathering"]', 3.2, 'https://example.com/sop/attach-sleeve'),
            ('Hem Bottom', 'OP-004', '["Check hem width consistency", "Verify stitch visibility", "Inspect for waviness"]', 1.5, 'https://example.com/sop/hem-bottom'),
            ('Buttonhole Creation', 'OP-005', '["Check buttonhole size", "Verify buttonhole spacing", "Inspect for fraying"]', 0.8, 'https://example.com/sop/buttonhole');
        
        RAISE NOTICE 'Created operations table and inserted sample data';
    ELSE
        RAISE NOTICE 'Operations table already exists';
    END IF;
END $$;
