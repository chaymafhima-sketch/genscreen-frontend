"use client";

export default function Header() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="text-lg font-semibold">Dashboard Admin</h1>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}