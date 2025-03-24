"use client";

import { useState, useEffect } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  Package, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut,
  Edit2,
  Save,
  Crown,
  Gift,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { trpc } from '@/trpc/client';
import { User as UserType, Order as OrderType, Product as ProductType } from '@/payload-types';

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const { signOut } = useAuth();
  const router = useRouter();

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = trpc.getUserInfo.useQuery();

  // Fetch orders with pagination
  const { data: ordersData, isLoading: isLoadingOrders } = trpc.order.getOrders.useQuery(
    {
      page: currentPage,
      limit: ordersPerPage,
      user: userData?.user?.role !== 'admin' ? userData?.user?.id : undefined,
    },
    { enabled: !!userData?.user }
  );

  const totalPages = Math.ceil((ordersData?.totalDocs || 0) / ordersPerPage);

  // Update user mutation
  const { mutate: updateUser } = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  useEffect(() => {
    if (userData?.user) {
      setProfileData({
        name: userData.user.name || '',
        email: userData.user.email || '',
        phone: userData.user.phone || '',
        address: userData.user.address || '',
      });
    }
  }, [userData]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSaveProfile = () => {
    if (!userData?.user?.id) return;
    
    updateUser({
      id: userData.user.id,
      ...profileData,
    });
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <MaxWidthWrapper>
          <div className="py-12">
            <div className="animate-pulse">
              <div className="h-32 bg-white/5 rounded-2xl mb-12" />
              <div className="h-8 w-48 bg-white/5 rounded mb-6" />
              <div className="space-y-4">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <MaxWidthWrapper>
          <div className="py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gold-500 mb-4">Please sign in to view your account</h1>
              <Button onClick={() => router.push('/sign-in')} className="bg-gold-500 hover:bg-gold-600">
                Sign In
              </Button>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    );
  }

  const user = userData.user;

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Profile Header */}
          <div className="mb-12">
            <div className="p-8 bg-card rounded-lg shadow-sm border">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                  {(user.avatar as { url: string })?.url ? (
                    <Image
                      src={(user.avatar as { url: string })?.url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-2xl font-medium">
                      {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-foreground">{profileData.name}</h1>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">Admin</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px] bg-muted">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-foreground">
                    <span>Personal Information</span>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveProfile}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-foreground">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-foreground">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address" className="text-foreground">Address</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingOrders ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-muted rounded-lg" />
                        <div className="h-20 bg-muted rounded-lg" />
                        <div className="h-20 bg-muted rounded-lg" />
                      </div>
                    ) : !ordersData?.docs || ordersData.docs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No orders found</p>
                        <Button 
                          onClick={() => router.push('/products')} 
                          className="mt-4"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <>
                        {ordersData.docs.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Package className="h-8 w-8 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Order #{order.id}</p>
                                {user.role === 'admin' && order.user && (
                                  <p className="text-sm text-muted-foreground">
                                    Customer: {(order.user as any).name || (order.user as any).email}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {(order.items as any[])?.length || 0} items • £{(order.totalAmount as number) || 0}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`${
                                order.status === 'delivered' ? 'text-green-600' :
                                order.status === 'processing' ? 'text-yellow-600' :
                                'text-muted-foreground'
                              }`}>
                                {order.status ? (order.status as string).charAt(0).toUpperCase() + (order.status as string).slice(1) : ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt as string).toLocaleDateString()}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => router.push(`/orders/${order.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                        {ordersData && ordersData.totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <span className="flex items-center text-muted-foreground">
                              Page {currentPage} of {ordersData.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(ordersData.totalPages, p + 1))}
                              disabled={currentPage === ordersData.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </h3>
                    <Button variant="outline" className="w-full">
                      Add New Card
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Order Updates</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Promotional Emails</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                      <Shield className="h-5 w-5" />
                      Privacy
                    </h3>
                    <Button variant="outline" className="w-full">
                      Manage Privacy Settings
                    </Button>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 