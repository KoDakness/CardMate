/*
  # Add insert policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile
    - This fixes the 403 error during sign up when trying to create a new profile

  Note: This policy is required to allow users to create their profile during registration
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);