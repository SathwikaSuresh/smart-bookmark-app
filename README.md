# 🔖 Smart Bookmark Manager

A full-stack bookmark management web app that allows users to save, organize and access links instantly from any device.

The goal of this project was to build a real-world CRUD application with authentication, database syncing and realtime updates — similar to how modern productivity tools work.

---

## 🚀 Features

* Add, edit and delete bookmarks
* Store title + URL
* Persistent cloud storage
* Realtime syncing
* Responsive UI
* Fast search and filtering
* Clean minimal dashboard

---

## 🛠️ Tech Stack

Frontend: React / Next.js
Backend & DB: Supabase (PostgreSQL + Realtime)
Styling: Tailwind CSS
Deployment: Vercel

---

## 🧠 Problems I Faced & How I Solved Them

### 1) Delete not working (Supabase Realtime Error)

**Problem:**
When deleting a bookmark, the console showed:

> cannot delete from table "bookmarks" because it does not have a replica identity and publishes deletes

**Why it happened:**
Supabase realtime needs a primary key to track row changes.
My table didn’t have REPLICA IDENTITY FULL enabled.

**Solution:**
I enabled replica identity from SQL editor:

```sql
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```

After this, realtime delete events started working correctly.

---

### 2) Data not updating automatically

**Problem:**
UI only updated after refresh.

**Why it happened:**
I initially fetched data only once using useEffect.

**Solution:**
I implemented Supabase realtime subscription:

* Subscribed to INSERT, UPDATE and DELETE events
* Updated local state dynamically

Now bookmarks sync instantly across tabs.

---

### 3) "bookmarks is not defined" error in Next.js

**Problem:**
Page crashed during rendering.

**Cause:**
Component rendered before data loaded from DB.

**Fix:**
Added loading state & conditional rendering:

```js
if (!bookmarks) return <p>Loading...</p>;
```

---

### 4) Accidentally uploading node_modules to GitHub

**Problem:**
Repository size became huge and push failed.

**Solution:**
Created `.gitignore` and removed cached files:

```bash
git rm -r --cached node_modules
```

---

## 💡 What I Learned

* Realtime databases require primary key tracking
* Difference between client state vs server state
* Importance of loading states in React apps
* How production apps handle CRUD synchronization
* Proper GitHub project structure

## 🔗 Live Demo

(Add deployed link)


## 👩‍💻 Author

Sathwika Pulusu

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
