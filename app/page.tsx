"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Bookmark = {
  id: string;        // uuid (IMPORTANT)
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // ---------------- AUTH ----------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- FETCH BOOKMARKS ----------------
  const fetchBookmarks = async (uid: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  useEffect(() => {
    if (user) fetchBookmarks(user.id);
  }, [user]);

  // ---------------- ADD ----------------
  const addBookmark = async () => {
    if (!title || !url || !user) return;

    const { error } = await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    if (error) console.log("INSERT ERROR:", error);

    setTitle("");
    setUrl("");
  };

  // ---------------- DELETE ----------------
const deleteBookmark = async (id: string) => {
  console.log("Deleting:", id);

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .select();

  console.log("DELETE RESULT:", { data, error });

  if (error) {
    alert(error.message);
    return;
  }

  setBookmarks((prev) => prev.filter((b) => b.id !== id));
};

  // ---------------- REALTIME ----------------
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {

          // INSERT
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
          }

          // DELETE
          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }

          // UPDATE
          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Bookmark) : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ---------------- LOGIN ----------------
  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setBookmarks([]);
  };

  // ---------------- UI ----------------
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Smart Bookmark Manager</h1>
        <button onClick={login}>Login with Google</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>Smart Bookmark Manager</h1>

      <p>
        Logged in as: <b>{user.email}</b>
      </p>

      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Add Bookmark</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={addBookmark}>Save Bookmark</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>Your Bookmarks</h3>

      {bookmarks.length === 0 && <p>No bookmarks yet.</p>}

      {bookmarks.map((b) => (
        <div key={b.id} style={{ marginBottom: 15 }}>
          <b>{b.title}</b>
          <div>
            <a href={b.url} target="_blank">
              {b.url}
            </a>
          </div>

          <button
            onClick={() => deleteBookmark(b.id)}
            style={{
              marginTop: 5,
              padding: "5px 10px",
              background: "red",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}