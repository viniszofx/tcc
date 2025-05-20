import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseClient } from "@/utils/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  provider: string;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export default async function Show() {
  const supabase = await supabaseClient();
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No users found</div>;
  }

  const users = data as User[];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="bg-[var(--bg-simple)]">
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Provider:</strong> {user.provider}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
