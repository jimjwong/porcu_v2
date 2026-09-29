import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  Plus, 
  Link2, 
  QrCode, 
  BarChart3, 
  Copy, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Download,
  Search,
  ArrowUpRight,
  MousePointer2,
  Globe,
  Smartphone,
  LogOut,
  LogIn
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { nanoid } from "nanoid";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ShortLink, AnalyticsData } from "@/src/types";
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  handleFirestoreError, 
  OperationType 
} from "@/src/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  increment,
  getDocs,
  limit,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("links");
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLinks([]);
      return;
    }

    const q = query(
      collection(db, "links"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => doc.data() as ShortLink);
      setLinks(fetchedLinks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "links");
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedLink || !user) return;

    // Fetch clicks for analytics
    const clicksRef = collection(db, "links", selectedLink.id, "clicks");
    const q = query(clicksRef, orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clicks = snapshot.docs.map(doc => doc.data());
      
      // Simple aggregation for UI
      const clicksOverTime = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const count = clicks.filter(c => {
          const clickDate = new Date(c.timestamp);
          return clickDate.toDateString() === d.toDateString();
        }).length;
        return { date: dateStr, clicks: count };
      }).reverse();

      const referrersMap: Record<string, number> = {};
      clicks.forEach(c => {
        const ref = c.referrer || "Direct";
        referrersMap[ref] = (referrersMap[ref] || 0) + 1;
      });

      setAnalytics({
        totalClicks: selectedLink.clicks,
        clicksOverTime,
        referrers: Object.entries(referrersMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        browsers: [] // Simplified
      });
    });

    return () => unsubscribe();
  }, [selectedLink, user]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !user) return;

    try {
      new URL(urlInput);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    const id = nanoid(6);
    const shortUrl = `${window.location.origin}/r/${id}`;
    
    const newLink: ShortLink = {
      id,
      originalUrl: urlInput,
      shortUrl,
      userId: user.uid,
      createdAt: Date.now(),
      clicks: 0,
      title: new URL(urlInput).hostname
    };

    try {
      await setDoc(doc(db, "links", id), newLink);
      setUrlInput("");
      toast.success("Link shortened successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "links");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <Card className="max-w-md w-full rounded-3xl border-zinc-100 shadow-xl p-8 text-center">
          <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-display font-black mb-4">Welcome Back</h2>
          <p className="text-zinc-500 mb-8">Sign in to manage your links and view detailed analytics.</p>
          <Button 
            onClick={loginWithGoogle}
            className="w-full h-14 rounded-2xl bg-zinc-950 text-white font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-black">My Dashboard</h1>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-zinc-400 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-zinc-500">Manage your sharp links and track performance.</p>
          </div>
          <form onSubmit={handleCreateLink} className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Paste a long URL..." 
                className="pl-10 h-12 rounded-xl border-zinc-200 bg-white"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 px-6 rounded-xl bg-accent hover:bg-orange-600 text-white font-bold">
              Shorten
            </Button>
          </form>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-zinc-100 p-1 rounded-xl">
            <TabsTrigger value="links" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Link2 className="w-4 h-4 mr-2" />
              Links
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {links.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-zinc-200 text-center">
                      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
                        <Plus className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-zinc-400">No links yet. Create your first one!</h3>
                    </div>
                  ) : (
                    links.map((link) => (
                      <motion.div
                        key={link.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedLink(link)}
                        className={`group bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
                          selectedLink?.id === link.id ? "border-accent ring-1 ring-accent/20" : "border-zinc-100 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-accent transition-colors">
                              <Link2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg mb-1 truncate">{link.title || "Untitled Link"}</h3>
                              <p className="text-zinc-400 text-sm truncate max-w-[200px] md:max-w-md mb-2">
                                {link.originalUrl}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-accent font-mono font-bold truncate">{link.shortUrl}</span>
                                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 font-medium">
                                  <MousePointer2 className="w-3 h-3 mr-1" />
                                  {link.clicks} clicks
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-lg hover:bg-zinc-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(link.shortUrl);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-zinc-100">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl p-1">
                                <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => window.open(link.originalUrl, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open Original
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm("Are you sure you want to delete this link?")) {
                                      try {
                                        await deleteDoc(doc(db, "links", link.id));
                                        if (selectedLink?.id === link.id) setSelectedLink(null);
                                        toast.success("Link deleted");
                                      } catch (error) {
                                        handleFirestoreError(error, OperationType.DELETE, "links");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-6">
                {selectedLink ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={selectedLink.id}
                  >
                    <Card className="rounded-3xl border-zinc-100 shadow-sm overflow-hidden">
                      <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                        <CardDescription>Details for {selectedLink.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-8">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm mb-4">
                            <QRCodeSVG 
                              value={selectedLink.shortUrl} 
                              size={160}
                              level="H"
                              includeMargin
                            />
                          </div>
                          <p className="text-sm text-zinc-500 mb-4">Scan to visit link</p>
                          <Button 
                            onClick={() => {
                              const svg = document.querySelector('svg');
                              if (svg) {
                                const svgData = new XMLSerializer().serializeToString(svg);
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                const img = new Image();
                                img.onload = () => {
                                  canvas.width = img.width;
                                  canvas.height = img.height;
                                  ctx?.drawImage(img, 0, 0);
                                  const pngFile = canvas.toDataURL("image/png");
                                  const downloadLink = document.createElement("a");
                                  downloadLink.download = `qr-${selectedLink.id}.png`;
                                  downloadLink.href = pngFile;
                                  downloadLink.click();
                                };
                                img.src = "data:image/svg+xml;base64," + btoa(svgData);
                              }
                            }}
                            className="w-full rounded-xl bg-zinc-950 text-white font-bold h-12"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Code
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Quick Stats</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 p-4 rounded-2xl">
                              <span className="text-2xl font-black block">{selectedLink.clicks}</span>
                              <span className="text-xs text-zinc-500 font-medium">Total Clicks</span>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-2xl">
                              <span className="text-2xl font-black block">--</span>
                              <span className="text-xs text-zinc-500 font-medium">Unique Visitors</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-zinc-100/50 rounded-3xl border border-dashed border-zinc-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-300 mb-4">
                      <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-zinc-400">Select a link to view details</h3>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            {analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Clicks" value={analytics.totalClicks.toString()} icon={<MousePointer2 />} />
                  <StatCard title="Avg. CTR" value="--" icon={<ArrowUpRight />} />
                  <StatCard title="Top Region" value="--" icon={<Globe />} />
                  <StatCard title="Mobile Users" value="--" icon={<Smartphone />} />
                </div>

                <Card className="rounded-3xl border-zinc-100 shadow-sm">
                  <CardHeader>
                    <CardTitle>Clicks Over Time</CardTitle>
                    <CardDescription>Performance across the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.clicksOverTime}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorClicks)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-3xl border-zinc-100 shadow-sm">
                    <CardHeader>
                      <CardTitle>Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.referrers.length === 0 ? (
                          <p className="text-zinc-400 text-center py-8">No data yet</p>
                        ) : (
                          analytics.referrers.map((ref) => (
                            <div key={ref.name} className="flex items-center justify-between">
                              <span className="text-zinc-600 font-medium truncate max-w-[150px]">{ref.name}</span>
                              <div className="flex items-center gap-4 flex-1 mx-8">
                                <div className="h-2 bg-zinc-100 rounded-full flex-1 overflow-hidden">
                                  <div 
                                    className="h-full bg-accent" 
                                    style={{ width: `${(ref.count / analytics.totalClicks) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="font-bold">{ref.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-zinc-100 shadow-sm">
                    <CardHeader>
                      <CardTitle>Browser Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-center py-8">Browser data coming soon</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center p-12 text-center bg-zinc-100/50 rounded-3xl border border-dashed border-zinc-200">
                <BarChart3 className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="font-bold text-zinc-400">Select a link to view analytics</h3>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <Card className="rounded-3xl border-zinc-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
            {icon}
          </div>
          {trend && (
            <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100">
              {trend}
            </Badge>
          )}
        </div>
        <h4 className="text-zinc-500 text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
