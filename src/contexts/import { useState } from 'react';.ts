import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function AvatarUpload() {
  const { user, setUser } = useAuth(); // Get setUser from AuthContext
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) return;

    setUploading(true);

    try {
      const filename = `${user.id}_${selectedFile.name}`; // Prefix with user ID
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, selectedFile, {
          cacheControl: '3600',
          upsert: false, // Prevent overwriting existing files
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar.');
        return;
      }

      const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filename}`;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        alert('Failed to update user profile.');
      } else {
        // Update the user context with the new avatar URL
        setUser({ ...user, avatar_url: avatarUrl });
        alert('Avatar uploaded successfully!');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Upload Avatar'}
      </button>
    </div>
  );
}

export default AvatarUpload;