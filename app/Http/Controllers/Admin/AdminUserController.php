<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        // Pencarian dan filter (opsional)
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function active(Request $request)
    {
        // Filter user aktif + filter tambahan (search, activity_level, date range)
        $query = User::where('is_active', true);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($level = $request->input('activity_level')) {
            if ($level === 'high') {
                $query->where('orders_count', '>=', 10);
            } elseif ($level === 'medium') {
                $query->where('orders_count', '>=', 5)->where('orders_count', '<', 10);
            } elseif ($level === 'low') {
                $query->where('orders_count', '>=', 1)->where('orders_count', '<', 5);
            } elseif ($level === 'inactive') {
                $query->where('orders_count', 0);
            }
        }

        if ($date_from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $date_from);
        }
        if ($date_to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $date_to);
        }

        // Eager load statistik belanja
        $users = $query->withCount('orders')
            ->withSum('orders as total_spent', 'total_amount')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        // Statistik summary
        $statQuery = User::where('is_active', true);
        $statistics = [
            'total_active'    => $statQuery->count(),
            'new_this_month'  => $statQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            'with_orders'     => $statQuery->whereHas('orders')->count(),
            'total_spent'     => $statQuery->withSum('orders as total_spent', 'total_amount')->get()->sum('total_spent'),
            'average_orders'  => round($statQuery->withCount('orders')->get()->avg('orders_count')),
            'last_30_days'    => $statQuery->where('last_login_at', '>=', now()->subDays(30))->count(),
        ];

        // Tambahkan last_page_url agar frontend tidak error
        $usersArray = $users->toArray();
        $usersArray['last_page_url'] = $users->url($users->lastPage());

        return Inertia::render('Admin/Users/Active', [
            'users'      => $usersArray,
            'statistics' => $statistics,
            'filters'    => $request->all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        try {
            if ($user->id === auth()->id()) {
                return back()->withErrors(['delete' => 'Anda tidak dapat menghapus akun Anda sendiri']);
            }

            if (method_exists($user, 'orders') && $user->orders()->exists()) {
                return back()->withErrors(['delete' => 'User tidak dapat dihapus karena memiliki data terkait']);
            }

            $userName = $user->name;
            $user->delete();

            return redirect()->route('admin.users.index')
                ->with('success', 'User "' . $userName . '" berhasil dihapus');

        } catch (\Exception $e) {
            Log::error('AdminUserController@destroy error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus user: ' . $e->getMessage()]);
        }
    }
}
