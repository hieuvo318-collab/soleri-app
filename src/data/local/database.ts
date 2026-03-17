import * as SQLite from 'expo-sqlite';

// Tên cơ sở dữ liệu nội bộ cho Soleri
const DB_NAME = 'soleri_v1.db';

/**
 * Hàm khởi tạo Database
 * Sử dụng Clean Architecture để sau này dễ thao tác inject vào Repositories
 */
export const initDatabase = async () => {
  try {
    // Mở hoặc khởi tạo DB
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    // Kích hoạt rảng buộc khóa ngoại để đảm bảo toàn vẹn dữ liệu
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // 1. Tạo bảng profiles (Lưu thông tin và mục tiêu cá nhân)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        daily_calorie_goal INTEGER NOT NULL,
        weekly_dining_budget REAL NOT NULL,
        current_weight REAL DEFAULT 0,
        target_weight REAL DEFAULT 0,
        activity_level REAL DEFAULT 1.2,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await db.execAsync("ALTER TABLE profiles ADD COLUMN current_weight REAL DEFAULT 0;"); } catch (_) { }
    try { await db.execAsync("ALTER TABLE profiles ADD COLUMN target_weight REAL DEFAULT 0;"); } catch (_) { }
    try { await db.execAsync("ALTER TABLE profiles ADD COLUMN activity_level REAL DEFAULT 1.2;"); } catch (_) { }

    // 2. Tạo bảng budgets (Theo dõi ngân sách đang hoạt động theo chu kỳ)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        amount_spent REAL DEFAULT 0,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );
    `);

    // 3. Tạo bảng logs (Theo dõi lịch sử tiêu thụ calo và chi tiêu)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        log_date DATE NOT NULL,
        calories_consumed INTEGER NOT NULL,
        food_name TEXT,
        is_dining_out BOOLEAN DEFAULT 0,      -- 1: Ăn hàng (tốn tiền), 0: Nấu/Ăn ở nhà
        cost REAL DEFAULT 0,                  -- Chi phí ăn ngoài
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );
    `);

    console.log('Database đã được khởi tạo thành công.');
    return db;
  } catch (error) {
    console.error('Lỗi khi khởi tạo database:', error);
    throw error;
  }
};
