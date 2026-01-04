import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, DollarSign, TrendingUp, Loader2, FileText } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import nunsaLogo from "@/assets/nunsa-logo.png";
import { generateSalaryReportPDF } from "@/lib/pdfGenerator";
import { useFinanceData } from "@/hooks/useFinanceData";

type AppRole = "super_admin" | "admin" | "finance_officer";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole | null;
  role_id: string | null;
  total_income: number;
  monthly_income: number;
  estimated_salary: number;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  finance_officer: "Finance Officer",
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "outline"> = {
  super_admin: "default",
  admin: "secondary",
  finance_officer: "outline",
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const { settings } = useFinanceData();
  
  const salaryPercentage = settings?.salary_percentage ?? 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) throw rolesError;

      // Fetch all income for revenue calculation
      const { data: allIncome, error: incomeError } = await supabase
        .from("income")
        .select("recorded_by, amount, created_at");

      if (incomeError) throw incomeError;

      // Get current month boundaries
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Map profiles with roles and income data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        
        // Calculate total income recorded by this user
        const userIncomeRecords = allIncome?.filter((i) => i.recorded_by === profile.id) || [];
        const totalIncome = userIncomeRecords.reduce((sum, i) => sum + Number(i.amount), 0);
        
        // Calculate monthly income
        const monthlyIncomeRecords = userIncomeRecords.filter((i) => {
          const date = new Date(i.created_at);
          return date >= monthStart && date <= monthEnd;
        });
        const monthlyIncome = monthlyIncomeRecords.reduce((sum, i) => sum + Number(i.amount), 0);
        
        // Calculate estimated salary based on configured percentage
        const estimatedSalary = monthlyIncome * (salaryPercentage / 100);

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: userRole?.role as AppRole | null,
          role_id: userRole?.id || null,
          total_income: totalIncome,
          monthly_income: monthlyIncome,
          estimated_salary: estimatedSalary,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [salaryPercentage]);

  const handleRoleChange = async (userId: string, newRole: AppRole | "none") => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUpdating(userId);

    try {
      if (newRole === "none") {
        // Remove role
        if (user.role_id) {
          const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("id", user.role_id);

          if (error) throw error;

          // Log audit
          await supabase.rpc("log_audit_action", {
            _action_type: "role_removed",
            _details: { user_email: user.email, previous_role: user.role },
          });
        }
      } else if (user.role_id) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", user.role_id);

        if (error) throw error;

        // Log audit
        await supabase.rpc("log_audit_action", {
          _action_type: "role_updated",
          _details: { user_email: user.email, previous_role: user.role, new_role: newRole },
        });
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;

        // Log audit
        await supabase.rpc("log_audit_action", {
          _action_type: "role_assigned",
          _details: { user_email: user.email, new_role: newRole },
        });
      }

      toast({
        title: "Success",
        description: `Role ${newRole === "none" ? "removed" : "updated"} for ${user.email}`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const totalRevenue = users.reduce((sum, u) => sum + u.total_income, 0);
  const totalMonthlyRevenue = users.reduce((sum, u) => sum + u.monthly_income, 0);
  const totalSalaries = users.reduce((sum, u) => sum + u.estimated_salary, 0);

  const handleDownloadSalaryReport = () => {
    generateSalaryReportPDF(users, salaryPercentage, settings);
    toast({ title: "Salary Report Generated", description: "PDF has been downloaded." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={nunsaLogo} alt="NUNSA Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-display font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and view revenue performance</p>
            </div>
          </div>
          <Button onClick={handleDownloadSalaryReport} variant="gradient">
            <FileText className="h-4 w-4 mr-2" />
            Download Salary Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardDescription>Total Users</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <CardDescription>Total Revenue Generated</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ₦{totalRevenue.toLocaleString("en-NG")}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardDescription>This Month's Revenue</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ₦{totalMonthlyRevenue.toLocaleString("en-NG")}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <CardDescription>Est. Total Salaries ({salaryPercentage}%)</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                ₦{totalSalaries.toLocaleString("en-NG")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users & Revenue Performance
            </CardTitle>
            <CardDescription>
              Assign roles and track revenue generated by each user. Salary is calculated as {salaryPercentage}% of monthly income recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">Monthly Revenue</TableHead>
                      <TableHead className="text-right">Est. Salary ({salaryPercentage}%)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name || "No name"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.role ? (
                              <Badge variant={roleBadgeVariants[user.role]}>
                                {roleLabels[user.role]}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                No Role
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₦{user.total_income.toLocaleString("en-NG")}
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            ₦{user.monthly_income.toLocaleString("en-NG")}
                          </TableCell>
                          <TableCell className="text-right font-medium text-success">
                            ₦{user.estimated_salary.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role || "none"}
                              onValueChange={(value) => handleRoleChange(user.id, value as AppRole | "none")}
                              disabled={updating === user.id}
                            >
                              <SelectTrigger className="w-40">
                                {updating === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SelectValue placeholder="Assign role" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Role</SelectItem>
                                <SelectItem value="finance_officer">Finance Officer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Salary Calculation</h3>
                <p className="text-muted-foreground mt-1">
                  Estimated monthly salary is calculated as <strong>{salaryPercentage}%</strong> of the total income 
                  recorded by each user in the current month ({format(new Date(), "MMMM yyyy")}). 
                  This provides a performance-based incentive for staff. Super admins can change this percentage in Settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
