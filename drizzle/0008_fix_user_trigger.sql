-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simpler, more robust function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  -- Extract role and name from user metadata with defaults
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'rider');
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', '');

  -- Insert profile record
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, user_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;
