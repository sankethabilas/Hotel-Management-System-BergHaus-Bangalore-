export default function AdminStaffRegistrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Registration</h1>
        <p className="text-sm text-gray-600">Placeholder page (no backend wired)</p>
      </div>
      <div className="admin-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input mt-1" placeholder="Enter name" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <input className="form-input mt-1" placeholder="Front Desk / Chef" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input mt-1" placeholder="name@hotel.com" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input mt-1" placeholder="07XXXXXXXX" />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary" style={{ backgroundColor: "#006bb8" }}>Save</button>
        </div>
      </div>
    </div>
  );
}


