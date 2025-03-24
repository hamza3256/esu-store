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

  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = trpc.order.getUserOrders.useQuery(
    undefined,
    { enabled: !!userData?.user }
  );

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Profile Header */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-purple-500/20 rounded-2xl" />
            <div className="relative p-8 flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gold-500">
                {(user.avatar as { url: string })?.url ? (
                  <Image
                    src={(user.avatar as { url: string })?.url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gold-500/20 text-gold-500 text-2xl font-bold">
                    {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-gold-500 hover:bg-gold-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gold-500">{profileData.name}</h1>
                <p className="text-gray-300">{profileData.email}</p>
                {user.role === 'admin' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Crown className="h-4 w-4 text-gold-500" />
                    <span className="text-sm text-gold-500">Admin</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px] bg-white/5 border border-white/10">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-500">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-500">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-500">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-500">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gold-500">
                    <span>Personal Information</span>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-gold-500/50 text-gold-500 hover:bg-gold-500/20"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveProfile}
                        className="border-gold-500/50 text-gold-500 hover:bg-gold-500/20"
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
                      <Label htmlFor="name" className="text-gray-300">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 focus:border-gold-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 focus:border-gold-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 focus:border-gold-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address" className="text-gray-300">Address</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/10 focus:border-gold-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-gold-500">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingOrders ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-white/5 rounded-lg" />
                        <div className="h-20 bg-white/5 rounded-lg" />
                        <div className="h-20 bg-white/5 rounded-lg" />
                      </div>
                    ) : orders?.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300">No orders found</p>
                        <Button 
                          onClick={() => router.push('/products')} 
                          className="mt-4 bg-gold-500 hover:bg-gold-600"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      orders?.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-4">
                            <Package className="h-8 w-8 text-gold-500" />
                            <div>
                              <p className="font-medium text-gold-500">Order #{order.id}</p>
                              <p className="text-sm text-gray-300">
                                {(order.items as any[])?.length || 0} items • £{(order.totalAmount as number) || 0}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`${
                              order.status === 'delivered' ? 'text-green-400' :
                              order.status === 'processing' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {order.status ? (order.status as string).charAt(0).toUpperCase() + (order.status as string).slice(1) : ''}
                            </p>
                            <p className="text-sm text-gray-300">
                              {new Date(order.createdAt as string).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            {/* <TabsContent value="wishlist" className="space-y-6">
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-gold-500">Saved Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {!user.wishlist || user.wishlist.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <p className="text-gray-300">Your wishlist is empty</p>
                        <Button 
                          onClick={() => router.push('/products')} 
                          className="mt-4 bg-gold-500 hover:bg-gold-600"
                        >
                          Browse Products
                        </Button>
                      </div>
                    ) : (
                      user.wishlist.map((product) => (
                        <div key={product.id} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                            <Image
                              src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop"}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Button 
                                variant="secondary" 
                                className="bg-gold-500 hover:bg-gold-600"
                                onClick={() => router.push(`/products/${product.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <h3 className="font-medium text-gold-500">{product.name}</h3>
                            <p className="text-gray-300">£{product.price}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-gold-500">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gold-500">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </h3>
                    <Button variant="outline" className="w-full border-gold-500/50 text-gold-500 hover:bg-gold-500/20">
                      Add New Card
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gold-500">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Order Updates</span>
                        <Button variant="outline" size="sm" className="border-gold-500/50 text-gold-500 hover:bg-gold-500/20">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Promotional Emails</span>
                        <Button variant="outline" size="sm" className="border-gold-500/50 text-gold-500 hover:bg-gold-500/20">Configure</Button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gold-500">
                      <Shield className="h-5 w-5" />
                      Privacy
                    </h3>
                    <Button variant="outline" className="w-full border-gold-500/50 text-gold-500 hover:bg-gold-500/20">
                      Manage Privacy Settings
                    </Button>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-4 border-t border-white/10">
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