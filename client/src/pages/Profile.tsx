import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Edit2, Trophy, Star, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="rtl min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="backdrop-blur-sm sticky top-0 z-50" style={{ borderBottom: "2px solid #ff007f" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold neon-text-pink">استدامة+</div>
          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="text-neon-cyan">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
        </div>
      </nav>

      <div className="container py-8">
        {/* Profile Header */}
        <div className="hud-frame p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: "linear-gradient(135deg, #ff007f, #00ffff)",
                  boxShadow: "0 0 30px #ff007f, inset 0 0 30px rgba(0,255,255,0.3)",
                }}
              >
                👤
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "#ff007f" }}>
                  {user?.name || "مستخدم"}
                </h1>
                <p style={{ color: "#00ffff" }}>{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  عضو منذ {new Date(user?.createdAt || Date.now()).toLocaleDateString("ar-AE")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-neon"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              تعديل الملف
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="hud-frame p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" style={{ color: "#ffff00" }} />
              <div>
                <div className="text-xs text-muted-foreground">إجمالي النقاط</div>
                <div className="text-2xl font-bold" style={{ color: "#ff007f" }}>
                  2,450
                </div>
              </div>
            </div>
          </div>

          <div className="hud-frame p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" style={{ color: "#00ffff" }} />
              <div>
                <div className="text-xs text-muted-foreground">المستوى</div>
                <div className="text-2xl font-bold" style={{ color: "#00ffff" }}>
                  5
                </div>
              </div>
            </div>
          </div>

          <div className="hud-frame p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8" style={{ color: "#00ff7f" }} />
              <div>
                <div className="text-xs text-muted-foreground">تحسن البصمة</div>
                <div className="text-2xl font-bold" style={{ color: "#00ff7f" }}>
                  15%
                </div>
              </div>
            </div>
          </div>

          <div className="hud-frame p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center" style={{ color: "#ff6600" }}>
                🏆
              </div>
              <div>
                <div className="text-xs text-muted-foreground">الشارات</div>
                <div className="text-2xl font-bold" style={{ color: "#ff6600" }}>
                  3/6
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="hud-frame p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#00ffff" }}>
              المعلومات الشخصية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm" style={{ color: "#00ffff" }}>الاسم</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  disabled={!isEditing}
                  className="w-full mt-2 px-4 py-2 rounded bg-black/50 border"
                  style={{
                    borderColor: isEditing ? "#ff007f" : "#333",
                    color: "#fff",
                  }}
                />
              </div>
              <div>
                <label className="text-sm" style={{ color: "#00ffff" }}>البريد الإلكتروني</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full mt-2 px-4 py-2 rounded bg-black/50 border"
                  style={{ borderColor: "#333", color: "#999" }}
                />
              </div>
              <div>
                <label className="text-sm" style={{ color: "#00ffff" }}>طريقة تسجيل الدخول</label>
                <input
                  type="text"
                  defaultValue={user?.loginMethod || ""}
                  disabled
                  className="w-full mt-2 px-4 py-2 rounded bg-black/50 border"
                  style={{ borderColor: "#333", color: "#999" }}
                />
              </div>
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button className="btn-neon flex-1">حفظ التغييرات</Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="hud-frame p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#00ffff" }}>
              التفضيلات
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #333" }}>
                <span>إشعارات الإنجازات</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #333" }}>
                <span>إشعارات التحديات</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #333" }}>
                <span>إشعارات البريد الإلكتروني</span>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4">
                <span>الوضع الداكن</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 hud-frame p-8" style={{ borderColor: "#ff0000" }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#ff0000" }}>
            منطقة الخطر
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">تسجيل الخروج</h3>
              <p className="text-sm text-muted-foreground mb-4">
                سيتم تسجيل خروجك من جميع الأجهزة
              </p>
              <Button
                onClick={handleLogout}
                className="w-full"
                style={{
                  background: "#ff0000",
                  color: "#fff",
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
