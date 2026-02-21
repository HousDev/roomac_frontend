
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Check, RefreshCw } from 'lucide-react';
// import { format } from 'date-fns';
// import { 
//   Building2, DoorOpen, Users, CreditCard, TrendingUp, 
//   MoreVertical, Filter, ChevronDown, Calendar, X, BarChart3, TrendingDown, DollarSign, ChevronLeft, ChevronRight, 
//   FileText, Receipt
// } from 'lucide-react';
// import { LineChart } from 'recharts';

// import { useEffect, useState, useMemo, useCallback } from 'react';
// import {
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   Legend,
//   Line,
//   BarChart,
//   Bar
// } from 'recharts';

// const api = {
//   properties: '/api/properties',
//   rooms: '/api/rooms',
//   tenants: '/api/tenants',
//   payments: '/api/payments?status=completed'
// };

// // Types
// type ComparisonMode = '1year' | '2year' | 'custom';
// type FinancialTab = 'all' | 'income' | 'expense' | 'profit';
// type ChartType = 'area' | 'line' | 'bar';
// type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom';

// interface MonthlySummary {
//   income: number;
//   expense: number;
//   netProfit: number;
// }

// // FinancialTrendChart Component - WORKING VERSION
// const FinancialTrendChart: React.FC<{ 
//   summary: MonthlySummary;
//   activeTab: FinancialTab;
//   chartType: ChartType;
//   selectedYear: number | 'all';
//   selectedMonth: string;
//   onTabChange: (tab: FinancialTab) => void;
//   onChartTypeChange: (type: ChartType) => void;
//   onYearChange: (year: number | 'all') => void;
//   onClose: () => void;
// }> = ({ summary, activeTab, chartType, selectedYear, selectedMonth, onTabChange, onChartTypeChange, onYearChange, onClose }) => {
//   // Add state for filter panel and comparison mode
//   const [showFilterPanel, setShowFilterPanel] = useState(false);
//   const [comparisonMode, setComparisonMode] = useState<'1year' | '2year' | '2month'>('1year');
//   const [selectedYear1, setSelectedYear1] = useState<string>('2024');
//   const [selectedYear2, setSelectedYear2] = useState<string>('2023');
//   const [firstMonth, setFirstMonth] = useState<string>('January');
//   const [firstYear, setFirstYear] = useState<string>('2024');
//   const [secondMonth, setSecondMonth] = useState<string>('June');
//   const [secondYear, setSecondYear] = useState<string>('2024');
  
//   // Local state for filtered data
//   const [filteredTrendData, setFilteredTrendData] = useState<any[]>([]);
//   const [chartTitle, setChartTitle] = useState("Financial Trend Analysis");
  
//   const allMonths = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
  
//   const availableYears = [2022, 2023, 2024, 2025, 2026];

//   // Base financial data for all years - REAL DATA
//   const getBaseTrendData = () => {
//     return [
//       // 2024 Data
//       { month: 'Jan', year: 2024, income: 382500, expense: 331500, profit: 51000 },
//       { month: 'Feb', year: 2024, income: 420000, expense: 310000, profit: 110000 },
//       { month: 'Mar', year: 2024, income: 480000, expense: 340000, profit: 140000 },
//       { month: 'Apr', year: 2024, income: 450000, expense: 390000, profit: 60000 },
//       { month: 'May', year: 2024, income: 520000, expense: 330000, profit: 190000 },
//       { month: 'Jun', year: 2024, income: 580000, expense: 410000, profit: 170000 },
      
//       // 2023 Data (85% of 2024)
//       { month: 'Jan', year: 2023, income: 325125, expense: 281775, profit: 43350 },
//       { month: 'Feb', year: 2023, income: 357000, expense: 263500, profit: 93500 },
//       { month: 'Mar', year: 2023, income: 408000, expense: 289000, profit: 119000 },
//       { month: 'Apr', year: 2023, income: 382500, expense: 331500, profit: 51000 },
//       { month: 'May', year: 2023, income: 442000, expense: 280500, profit: 161500 },
//       { month: 'Jun', year: 2023, income: 493000, expense: 348500, profit: 144500 },
      
//       // 2022 Data (70% of 2024)
//       { month: 'Jan', year: 2022, income: 267750, expense: 232050, profit: 35700 },
//       { month: 'Feb', year: 2022, income: 294000, expense: 217000, profit: 77000 },
//       { month: 'Mar', year: 2022, income: 336000, expense: 238000, profit: 98000 },
//       { month: 'Apr', year: 2022, income: 315000, expense: 273000, profit: 42000 },
//       { month: 'May', year: 2022, income: 364000, expense: 231000, profit: 133000 },
//       { month: 'Jun', year: 2022, income: 406000, expense: 287000, profit: 119000 },
//     ];
//   };

//   // Get filtered data based on comparison mode - WORKING FILTERING
//   const getFilteredData = useCallback(() => {
//     const baseData = getBaseTrendData();
    
//     console.log("🔄 Filtering with mode:", comparisonMode);
    
//     switch(comparisonMode) {
//       case '1year':
//         // Single year filter
//         if (selectedYear === 'all') {
//           console.log("📊 Showing ALL years data");
//           return baseData;
//         } else {
//           const filtered = baseData.filter(item => item.year === selectedYear);
//           console.log(`📊 Showing ${selectedYear} data:`, filtered.length, "points");
//           return filtered;
//         }
        
//       case '2year':
//         // Compare two years
//         const year1 = parseInt(selectedYear1 || "2024");
//         const year2 = parseInt(selectedYear2 || "2023");
//         const twoYearData = baseData.filter(item => item.year === year1 || item.year === year2);
//         console.log(`📊 Comparing ${year1} vs ${year2}:`, twoYearData.length, "points");
//         return twoYearData;
        
//       case '2month':
//         // Compare two specific months
//         const month1Abbr = firstMonth.substring(0, 3);
//         const month2Abbr = secondMonth.substring(0, 3);
        
//         const twoMonthData = baseData.filter(item => {
//           const isMonth1 = item.month === month1Abbr && item.year === parseInt(firstYear || "2024");
//           const isMonth2 = item.month === month2Abbr && item.year === parseInt(secondYear || "2024");
//           return isMonth1 || isMonth2;
//         });
        
//         // Format month names for display
//         const formattedData = twoMonthData.map(item => ({
//           ...item,
//           month: item.month === month1Abbr ? 
//             `${firstMonth.substring(0, 3)} ${firstYear}` : 
//             `${secondMonth.substring(0, 3)} ${secondYear}`
//         }));
        
//         console.log(`📊 Comparing ${firstMonth.substring(0, 3)} ${firstYear} vs ${secondMonth.substring(0, 3)} ${secondYear}:`, formattedData);
//         return formattedData;
        
//       default:
//         const defaultData = baseData.filter(item => item.year === (selectedYear === 'all' ? 2024 : selectedYear));
//         console.log("📊 Default data:", defaultData.length, "points");
//         return defaultData;
//     }
//   }, [comparisonMode, selectedYear, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear]);

//   // Initialize filtered data on component mount and when dependencies change
//   useEffect(() => {
//     console.log("🚀 Initializing filtered data");
//     const data = getFilteredData();
//     setFilteredTrendData(data);
    
//     // Update chart title
//     const label = getComparisonLabel();
//     setChartTitle(`Financial Trend Analysis - ${label}`);
//   }, [getFilteredData]);

//   // Get chart data based on active tab
//   const getChartData = useMemo(() => {
//     return () => {
//       const data = filteredTrendData.map(item => {
//         if (activeTab === 'income') return { 
//           month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
//           value: item.income, 
//           label: 'Income',
//           income: item.income,
//           expense: item.expense,
//           profit: item.profit,
//           year: item.year
//         };
//         if (activeTab === 'expense') return { 
//           month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
//           value: item.expense, 
//           label: 'Expense',
//           income: item.income,
//           expense: item.expense,
//           profit: item.profit,
//           year: item.year
//         };
//         if (activeTab === 'profit') return { 
//           month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`, 
//           value: item.profit, 
//           label: 'Profit',
//           income: item.income,
//           expense: item.expense,
//           profit: item.profit,
//           year: item.year
//         };
//         return { 
//           ...item, 
//           month: comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`,
//           income: item.income,
//           expense: item.expense,
//           profit: item.profit
//         };
//       });
      
//       console.log("📈 Chart data prepared:", data.length, "points");
//       return data;
//     };
//   }, [filteredTrendData, activeTab, comparisonMode]);

//   const chartData = getChartData();

//   // Calculate stats based on filtered data
//   const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
//   const totalExpense = chartData.reduce((sum, item) => sum + item.expense, 0);
//   const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);
//   const avgIncome = Math.round(totalIncome / (chartData.length || 1));
//   const avgExpense = Math.round(totalExpense / (chartData.length || 1));
//   const avgProfit = Math.round(totalProfit / (chartData.length || 1));

//   // Get chart colors based on active tab
//   const getChartColors = () => {
//     switch(activeTab) {
//       case 'income': return { stroke: '#10b981', gradient: 'url(#colorIncome)', name: 'Income' };
//       case 'expense': return { stroke: '#f43f5e', gradient: 'url(#colorExpense)', name: 'Expense' };
//       case 'profit': return { stroke: '#3b82f6', gradient: 'url(#colorProfit)', name: 'Profit' };
//       default: return null;
//     }
//   };

//   const chartColors = getChartColors();

//   // Get current comparison label
//   const getComparisonLabel = () => {
//     switch(comparisonMode) {
//       case '1year':
//         return selectedYear === 'all' ? 'All Years' : `Year ${selectedYear}`;
//       case '2year':
//         return `Compare ${selectedYear1} vs ${selectedYear2}`;
//       case '2month':
//         return `${firstMonth.substring(0, 3)} ${firstYear} vs ${secondMonth.substring(0, 3)} ${secondYear}`;
//       default:
//         return 'All Years';
//     }
//   };

//   // Apply filter function - WORKING
//   const applyFilters = () => {
//     console.log('🎯 Applying Financial Trend Filters:', {
//       comparisonMode,
//       selectedYear1,
//       selectedYear2,
//       firstMonth,
//       firstYear,
//       secondMonth,
//       secondYear
//     });
    
//     try {
//       // Get new filtered data
//       const newData = getFilteredData();
//       console.log('✅ New filtered data:', newData);
      
//       if (newData.length === 0) {
//         console.warn('⚠️ No data found for selected filters! Showing default data.');
//         // Show some default data instead
//         const defaultData = getBaseTrendData().filter(item => item.year === 2024);
//         setFilteredTrendData(defaultData);
//       } else {
//         setFilteredTrendData(newData);
//       }
      
//       // Update title
//       const label = getComparisonLabel();
//       setChartTitle(`Financial Trend Analysis - ${label}`);
      
//       setShowFilterPanel(false);
      
//       // Show success message
//       console.log('✅ Filter applied successfully! Showing', newData.length, 'data points');
      
//       // Optional: Show toast notification
//       alert(`✅ Filters Applied!\n\nMode: ${comparisonMode === '1year' ? 'Single Year' : comparisonMode === '2year' ? 'Compare Years' : 'Compare Months'}\nData Points: ${newData.length}`);
      
//     } catch (error) {
//       console.error('❌ Error applying filters:', error);
//       alert('❌ Error applying filters. Please try again.');
//     }
//   };

//   // Reset all filters - WORKING
//   const resetFilters = () => {
//     console.log('🔄 Resetting all filters');
    
//     setComparisonMode('1year');
//     setSelectedYear1('2024');
//     setSelectedYear2('2023');
//     setFirstMonth('January');
//     setFirstYear('2024');
//     setSecondMonth('June');
//     setSecondYear('2024');
    
//     // Reset to default data (2024 year)
//     const defaultData = getBaseTrendData().filter(item => item.year === 2024);
//     setFilteredTrendData(defaultData);
    
//     // Reset title
//     setChartTitle("Financial Trend Analysis - Year 2024");
    
//     // Update parent year
//     onYearChange(2024);
    
//     console.log('✅ All filters reset');
//     alert('✅ All filters reset to default');
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
//         {/* Main Content */}
//         <div className={`transition-all duration-300 ${showFilterPanel ? 'w-3/4' : 'w-full'}`}>
//           {/* Header */}
//           <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
//             <div className="flex items-center gap-4">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">{chartTitle}</h2>
//                 <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
//                   <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded mr-2">
//                     {comparisonMode === '1year' ? 'Single Year' : comparisonMode === '2year' ? 'Compare Years' : 'Compare Months'}
//                   </span>
//                   <span className="text-green-600 font-bold">
//                     {filteredTrendData.length} data points
//                   </span>
//                 </p>
//               </div>
              
//               {/* Filter Toggle Button */}
//               <button
//                 onClick={() => {
//                   setShowFilterPanel(!showFilterPanel);
//                   console.log("🔘 Filter panel toggled:", !showFilterPanel);
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-all group relative"
//               >
//                 <Filter className="w-5 h-5 text-blue-600" />
//                 {showFilterPanel && (
//                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
//                 )}
//                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
//               </button>
//             </div>
            
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-all"
//             >
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>

//           {/* Stats Overview */}
//           <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100">
//                 <div className="flex items-center gap-2">
//                   <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
//                     <TrendingUp className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-600">Total Income</p>
//                     <p className="text-lg font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
//                   </div>
//                 </div>
//                 <div className="mt-1 text-xs text-green-500">
//                   <span>Avg: ₹{avgIncome.toLocaleString()}</span>
//                 </div>
//               </div>
              
//               <div className="bg-white p-3 rounded-xl shadow-sm border border-red-100">
//                 <div className="flex items-center gap-2">
//                   <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
//                     <TrendingDown className="h-5 w-5 text-red-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-600">Total Expense</p>
//                     <p className="text-lg font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
//                   </div>
//                 </div>
//                 <div className="mt-1 text-xs text-red-500">
//                   <span>Avg: ₹{avgExpense.toLocaleString()}</span>
//                 </div>
//               </div>
              
//               <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100">
//                 <div className="flex items-center gap-2">
//                   <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
//                     <DollarSign className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-600">Net Profit</p>
//                     <p className="text-lg font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
//                   </div>
//                 </div>
//                 <div className="mt-1 text-xs text-blue-500">
//                   <span>Avg: ₹{avgProfit.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Chart Area */}
//           <div className="p-4">
//             <div className="h-[350px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 {chartType === 'area' ? (
//                   <AreaChart data={chartData}>
//                     <defs>
//                       <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
//                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
//                       </linearGradient>
//                       <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
//                         <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
//                       </linearGradient>
//                       <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                     <XAxis 
//                       dataKey="month" 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       dy={10}
//                       angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
//                       textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
//                     />
//                     <YAxis 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       tickFormatter={(value) => `₹${value/1000}k`}
//                     />
//                     <Tooltip 
//                       contentStyle={{ 
//                         borderRadius: '12px', 
//                         border: 'none', 
//                         boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
//                         padding: '12px'
//                       }}
//                       itemStyle={{ fontSize: '11px', fontWeight: 600 }}
//                       labelStyle={{ marginBottom: '6px', fontWeight: 700, color: '#1e293b' }}
//                       formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
//                     />
//                     <Legend 
//                       verticalAlign="top" 
//                       align="right" 
//                       iconType="circle" 
//                       wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
//                     />
                    
//                     {activeTab === 'all' ? (
//                       <>
//                         <Area 
//                           type="monotone" 
//                           dataKey="income" 
//                           stroke="#10b981" 
//                           strokeWidth={3} 
//                           fillOpacity={1} 
//                           fill="url(#colorIncome)" 
//                           name="Income"
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                         />
//                         <Area 
//                           type="monotone" 
//                           dataKey="expense" 
//                           stroke="#f43f5e" 
//                           strokeWidth={3} 
//                           fillOpacity={1} 
//                           fill="url(#colorExpense)" 
//                           name="Expense"
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                         />
//                         <Area 
//                           type="monotone" 
//                           dataKey="profit" 
//                           stroke="#3b82f6" 
//                           strokeWidth={3} 
//                           fillOpacity={1} 
//                           fill="url(#colorProfit)" 
//                           name="Profit"
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                         />
//                       </>
//                     ) : (
//                       <Area 
//                         type="monotone" 
//                         dataKey="value" 
//                         stroke={chartColors?.stroke}
//                         strokeWidth={3} 
//                         fillOpacity={1} 
//                         fill={chartColors?.gradient}
//                         name={chartColors?.name}
//                         activeDot={{ r: 6, strokeWidth: 0 }}
//                       />
//                     )}
//                   </AreaChart>
//                 ) : chartType === 'line' ? (
//                   <LineChart data={chartData}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                     <XAxis 
//                       dataKey="month" 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       dy={10}
//                       angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
//                       textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
//                     />
//                     <YAxis 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       tickFormatter={(value) => `₹${value/1000}k`}
//                     />
//                     <Tooltip 
//                       contentStyle={{ 
//                         borderRadius: '12px', 
//                         border: 'none', 
//                         boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
//                         padding: '12px'
//                       }}
//                       formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
//                     />
//                     <Legend 
//                       verticalAlign="top" 
//                       align="right" 
//                       iconType="circle" 
//                       wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
//                     />
//                     {activeTab === 'all' ? (
//                       <>
//                         <Line 
//                           type="monotone" 
//                           dataKey="income" 
//                           stroke="#10b981" 
//                           strokeWidth={3} 
//                           dot={{ r: 4, strokeWidth: 2, stroke: '#10b981', fill: 'white' }}
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                           name="Income" 
//                         />
//                         <Line 
//                           type="monotone" 
//                           dataKey="expense" 
//                           stroke="#f43f5e" 
//                           strokeWidth={3} 
//                           strokeDasharray="5 5"
//                           dot={{ r: 4, strokeWidth: 2, stroke: '#f43f5e', fill: 'white' }}
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                           name="Expense" 
//                         />
//                         <Line 
//                           type="monotone" 
//                           dataKey="profit" 
//                           stroke="#3b82f6" 
//                           strokeWidth={3} 
//                           dot={{ r: 4, strokeWidth: 2, stroke: '#3b82f6', fill: 'white' }}
//                           activeDot={{ r: 6, strokeWidth: 0 }}
//                           name="Profit" 
//                         />
//                       </>
//                     ) : (
//                       <Line 
//                         type="monotone" 
//                         dataKey="value" 
//                         stroke={chartColors?.stroke}
//                         strokeWidth={3} 
//                         dot={{ r: 4, strokeWidth: 2, stroke: chartColors?.stroke, fill: 'white' }}
//                         activeDot={{ r: 6, strokeWidth: 0 }}
//                         name={chartColors?.name}
//                       />
//                     )}
//                   </LineChart>
//                 ) : (
//                   <BarChart data={chartData}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                     <XAxis 
//                       dataKey="month" 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       dy={10}
//                       angle={comparisonMode === '2month' ? -45 : (chartData.length > 6 ? -45 : 0)}
//                       textAnchor={comparisonMode === '2month' ? 'end' : (chartData.length > 6 ? 'end' : 'middle')}
//                     />
//                     <YAxis 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
//                       tickFormatter={(value) => `₹${value/1000}k`}
//                     />
//                     <Tooltip 
//                       contentStyle={{ 
//                         borderRadius: '12px', 
//                         border: 'none', 
//                         boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
//                         padding: '12px'
//                     }}
//                       formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
//                     />
//                     <Legend 
//                       verticalAlign="top" 
//                       align="right" 
//                       iconType="circle" 
//                       wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '11px' }} 
//                     />
//                     {activeTab === 'all' ? (
//                       <>
//                         <Bar 
//                           dataKey="income" 
//                           fill="#10b981" 
//                           name="Income" 
//                           radius={[6, 6, 0, 0]} 
//                         />
//                         <Bar 
//                           dataKey="expense" 
//                           fill="#f43f5e" 
//                           name="Expense" 
//                           radius={[6, 6, 0, 0]} 
//                         />
//                         <Bar 
//                           dataKey="profit" 
//                           fill="#3b82f6" 
//                           name="Profit" 
//                           radius={[6, 6, 0, 0]} 
//                         />
//                       </>
//                     ) : (
//                       <Bar 
//                         dataKey="value" 
//                         fill={chartColors?.stroke}
//                         name={chartColors?.name}
//                         radius={[6, 6, 0, 0]}
//                       />
//                     )}
//                   </BarChart>
//                 )}
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Controls Footer */}
//           <div className="p-4 border-t border-gray-100 bg-gray-50">
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200">
//                   <span className="text-xs font-medium text-gray-700 px-1.5">View:</span>
//                   {(['all', 'income', 'expense', 'profit'] as FinancialTab[]).map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => onTabChange(tab)}
//                       className={`px-2 py-1 rounded text-xs font-medium transition-all ${
//                         activeTab === tab
//                           ? 'bg-blue-600 text-white'
//                           : 'hover:bg-gray-100 text-gray-700'
//                       }`}
//                     >
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>
                
//                 <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-gray-200">
//                   <span className="text-xs font-medium text-gray-700 px-1.5">Chart:</span>
//                   {(['area', 'bar'] as ChartType[]).map((type) => (
//                     <button
//                       key={type}
//                       onClick={() => onChartTypeChange(type)}
//                       className={`p-1.5 rounded transition-all ${
//                         chartType === type
//                           ? 'bg-blue-100 text-blue-600'
//                           : 'hover:bg-gray-100 text-gray-600'
//                       }`}
//                     >
//                       {type === 'area' && <LineChart className="w-3.5 h-3.5" />}
//                       {type === 'line' && <TrendingUp className="w-3.5 h-3.5" />}
//                       {type === 'bar' && <BarChart3 className="w-3.5 h-3.5" />}
//                     </button>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <div className="bg-white p-1.5 rounded-lg border border-gray-200">
//                   <select 
//                     className="bg-transparent border-none outline-none text-xs font-medium text-gray-700"
//                     value={selectedYear}
//                     onChange={(e) => onYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
//                   >
//                     <option value="all">All Years</option>
//                     {[2022, 2023, 2024, 2025, 2026].map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <button 
//                   onClick={() => {
//                     alert('Export feature coming soon!');
//                   }}
//                   className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
//                 >
//                   Export
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* FILTER PANEL - WORKING */}
//         <div 
//           className={`absolute right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
//             showFilterPanel ? 'w-1/4 translate-x-0' : 'w-0 translate-x-full'
//           }`}
//         >
//           <div className="h-full overflow-y-auto p-4">
//             <div className="mb-4 pb-3 border-b border-gray-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Filter className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800 text-sm">Filter Trends</h3>
//                     <p className="text-xs text-gray-500">Compare financial data</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setShowFilterPanel(false)}
//                   className="p-1 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X className="w-4 h-4 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {/* Comparison Mode Selection */}
//               <div>
//                 <h4 className="text-xs font-semibold text-gray-700 mb-2">Comparison Type</h4>
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => {
//                       setComparisonMode('1year');
//                       console.log("Mode changed to: Single Year");
//                     }}
//                     className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                       comparisonMode === '1year'
//                         ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
//                         : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                         <span>Single Year</span>
//                       </div>
//                       {comparisonMode === '1year' && <Check className="w-3.5 h-3.5 text-blue-500" />}
//                     </div>
//                   </button>

//                   {/* 2 Year Comparison */}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => {
//                         const newMode = comparisonMode === '2year' ? '1year' : '2year';
//                         setComparisonMode(newMode);
//                         console.log("Mode changed to:", newMode);
//                       }}
//                       className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                         comparisonMode === '2year'
//                           ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
//                           : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <div className="flex gap-0.5">
//                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                           </div>
//                           <span>Compare Years</span>
//                         </div>
//                         <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === '2year' ? 'rotate-180' : ''}`} />
//                       </div>
//                     </button>
                    
//                     {comparisonMode === '2year' && (
//                       <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 space-y-3">
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label>
//                             <div className="relative">
//                               <select
//                                 value={selectedYear1}
//                                 onChange={(e) => {
//                                   setSelectedYear1(e.target.value);
//                                   console.log("Year 1 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
//                               >
//                                 <option value="">Choose year</option>
//                                 {availableYears.map(year => (
//                                   <option key={year} value={year}>{year}</option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>
                          
//                           <div>
//                             <label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label>
//                             <div className="relative">
//                               <select
//                                 value={selectedYear2}
//                                 onChange={(e) => {
//                                   setSelectedYear2(e.target.value);
//                                   console.log("Year 2 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
//                                 >
//                                 <option value="">Choose year</option>
//                                 {availableYears.map(year => (
//                                   <option key={year} value={year}>{year}</option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Compare 2 Months */}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => {
//                         const newMode = comparisonMode === '2month' ? '1year' : '2month';
//                         setComparisonMode(newMode);
//                         console.log("Mode changed to:", newMode);
//                       }}
//                       className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                         comparisonMode === '2month'
//                           ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
//                           : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                           <span>Compare Months</span>
//                         </div>
//                         <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === '2month' ? 'rotate-180' : ''}`} />
//                       </div>
//                     </button>
                    
//                     {comparisonMode === '2month' && (
//                       <div className="bg-purple-50/30 rounded-lg border border-purple-100">
//                         <div className="p-3 space-y-3">
//                           {/* Month Selection Form */}
//                           <div className="space-y-3">
//                             <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700">
//                               <div>Month 1</div>
//                               <div>Month 2</div>
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-2">
//                               <select
//                                 value={firstMonth}
//                                 onChange={(e) => {
//                                   setFirstMonth(e.target.value);
//                                   console.log("Month 1 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                               >
//                                 <option value="">Select Month</option>
//                                 {allMonths.map(month => (
//                                   <option key={`first-${month}`} value={month}>{month.substring(0, 3)}</option>
//                                 ))}
//                               </select>
                              
//                               <select
//                                 value={secondMonth}
//                                 onChange={(e) => {
//                                   setSecondMonth(e.target.value);
//                                   console.log("Month 2 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                               >
//                                 <option value="">Select Month</option>
//                                 {allMonths.map(month => (
//                                   <option key={`second-${month}`} value={month}>{month.substring(0, 3)}</option>
//                                 ))}
//                               </select>
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-2">
//                               <select
//                                 value={firstYear}
//                                 onChange={(e) => {
//                                   setFirstYear(e.target.value);
//                                   console.log("Year 1 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                               >
//                                 <option value="">Year</option>
//                                 {availableYears.map(year => (
//                                   <option key={`first-${year}`} value={year}>{year}</option>
//                                 ))}
//                               </select>
                              
//                               <select
//                                 value={secondYear}
//                                 onChange={(e) => {
//                                   setSecondYear(e.target.value);
//                                   console.log("Year 2 selected:", e.target.value);
//                                 }}
//                                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                               >
//                                 <option value="">Year</option>
//                                 {availableYears.map(year => (
//                                   <option key={`second-${year}`} value={year}>{year}</option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>

//                           {/* Selected Preview */}
//                           {(firstMonth || secondMonth) && (
//                             <div className="p-2 bg-purple-100/30 rounded border border-purple-100">
//                               <div className="text-xs text-center">
//                                 <span className="font-medium text-purple-700">
//                                   {firstMonth && firstYear ? `${firstMonth.substring(0, 3)} ${firstYear}` : "___"}
//                                 </span>
//                                 <span className="mx-2 text-gray-400">vs</span>
//                                 <span className="font-medium text-purple-700">
//                                   {secondMonth && secondYear ? `${secondMonth.substring(0, 3)} ${secondYear}` : "___"}
//                                 </span>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="pt-3 border-t border-gray-100">
//                 <h4 className="text-xs font-semibold text-gray-700 mb-2">Actions</h4>
//                 <div className="space-y-2">
//                   <button 
//                     onClick={applyFilters}
//                     className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
//                   >
//                     <Check className="w-4 h-4" />
//                     Apply Filters
//                   </button>
//                   <button 
//                     onClick={resetFilters}
//                     className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-300"
//                   >
//                     <RefreshCw className="w-4 h-4" />
//                     Reset All
//                   </button>
//                 </div>
//               </div>

//               {/* Active Filters Display */}
//               <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//                 <p className="text-xs font-medium text-blue-800 mb-2">Active Filters</p>
//                 <div className="space-y-1">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-gray-600">Mode:</span>
//                     <span className="text-xs font-medium text-blue-700 capitalize">
//                       {comparisonMode === '1year' ? 'Single Year' : 
//                        comparisonMode === '2year' ? 'Compare Years' : 
//                        'Compare Months'}
//                     </span>
//                   </div>
//                   {comparisonMode === '2year' && (
//                     <>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">Year 1:</span>
//                         <span className="text-xs font-medium text-blue-700">
//                           {selectedYear1 || 'Not selected'}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">Year 2:</span>
//                         <span className="text-xs font-medium text-blue-700">
//                           {selectedYear2 || 'Not selected'}
//                         </span>
//                       </div>
//                     </>
//                   )}
//                   {comparisonMode === '2month' && (
//                     <>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">Month 1:</span>
//                         <span className="text-xs font-medium text-blue-700">
//                           {firstMonth ? `${firstMonth.substring(0, 3)} ${firstYear}` : 'Not selected'}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">Month 2:</span>
//                         <span className="text-xs font-medium text-blue-700">
//                           {secondMonth ? `${secondMonth.substring(0, 3)} ${secondYear}` : 'Not selected'}
//                         </span>
//                       </div>
//                     </>
//                   )}
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-gray-600">Current View:</span>
//                     <span className="text-xs font-medium text-blue-700">
//                       {getComparisonLabel()}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-gray-600">Chart Type:</span>
//                     <span className="text-xs font-medium text-blue-700 capitalize">
//                       {chartType}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-gray-600">Data Points:</span>
//                     <span className="text-xs font-medium text-green-700">
//                       {filteredTrendData.length}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     totalProperties: 0,
//     totalRooms: 0,
//     totalBeds: 0,
//     occupiedBeds: 0,
//     totalTenants: 0,
//     activeTenants: 0,
//     monthlyRevenue: 0,
//   });
//   const [firstMonth, setFirstMonth] = useState('');
//   const [firstYear, setFirstYear] = useState('');
//   const [secondMonth, setSecondMonth] = useState('');
//   const [secondYear, setSecondYear] = useState('');
  
//   // Filter states - Type corrections
//   const [selectedYear1, setSelectedYear1] = useState<string>('');
//   const [selectedYear2, setSelectedYear2] = useState<string>('');
  
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [isSelectingStartDate, setIsSelectingStartDate] = useState(false);
//   const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
//   const [startDateDisplay, setStartDateDisplay] = useState('');
//   const [endDateDisplay, setEndDateDisplay] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);
//   const [showFilterPanel, setShowFilterPanel] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState('January');
//   const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
//   const [showFilter, setShowFilter] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [showMonthCalendar, setShowMonthCalendar] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [showDateCalendar, setShowDateCalendar] = useState(false);
//   const [showTypeMenu, setShowTypeMenu] = useState(false);
//   const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
//   const [selectedDay, setSelectedDay] = useState(new Date().getDate());
//   const [occupancyDateFilter, setOccupancyDateFilter] = useState<DateFilterType>('today');
//   const [occupancySelectedDate, setOccupancySelectedDate] = useState<Date>(new Date());
//   const [showOccupancyCalendar, setShowOccupancyCalendar] = useState(false);
//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//   const [showYearCalendar, setShowYearCalendar] = useState(false);
//   const [yearRange, setYearRange] = useState(2020);
//   const [showFinancialTrend, setShowFinancialTrend] = useState(false);
//   const [financialTab, setFinancialTab] = useState<FinancialTab>('all');
//   const [chartType, setChartType] = useState<ChartType>('area');
//   const [financialYear, setFinancialYear] = useState<number | 'all'>('all');
//   const [financialMonth, setFinancialMonth] = useState('January');
//   const [selectedType, setSelectedType] = useState('');
//   type ComparisonMode = '1year' | '2year' | 'custom' | null;
//   const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('1year');
//   const [showComparisonDropdown, setShowComparisonDropdown] = useState(false);
//   const [customStartMonth, setCustomStartMonth] = useState('January');
//   const [customEndMonth, setCustomEndMonth] = useState('December');
//   const [customYear, setCustomYear] = useState(new Date().getFullYear());
//   const [showYear1Calendar, setShowYear1Calendar] = useState(false);
//   const [showYear2Calendar, setShowYear2Calendar] = useState(false);
//   const [showStartMonthCalendar, setShowStartMonthCalendar] = useState(false);
//   const [showEndMonthCalendar, setShowEndMonthCalendar] = useState(false);
//   const [showStartDayCalendar, setShowStartDayCalendar] = useState(false);
//   const [showEndDayCalendar, setShowEndDayCalendar] = useState(false);
//   const [showStartYearCalendar, setShowStartYearCalendar] = useState(false);
//   const [showEndYearCalendar, setShowEndYearCalendar] = useState(false);
//   const [customStartDay, setCustomStartDay] = useState<number | null>(null);
//   const [customEndDay, setCustomEndDay] = useState<number | null>(null);
//   const [customStartYear, setCustomStartYear] = useState<number | null>(null);
//   const [customEndYear, setCustomEndYear] = useState<number | null>(null);
  
//   // Example: Array with ALL years from your database
//   const allAvailableYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990];
  
//   const availableYears = [2021, 2022, 2023, 2024, 2025];
//   const allMonths = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   // Sample financial summary
//   const financialSummary: MonthlySummary = {
//     income: stats.monthlyRevenue,
//     expense: Math.round(stats.monthlyRevenue * 0.6),
//     netProfit: Math.round(stats.monthlyRevenue * 0.4)
//   };

//   // Tents data
//   const tentStats = {
//     active: 15,
//     inactive: 5,
//     total: 20
//   };
  
//   const tentOccupancyPercent = Math.round((tentStats.active / tentStats.total) * 100);
  
//   // Rooms data
//   const roomStats = {
//     active: 25,
//     inactive: 10,
//     total: 35
//   };
  
//   const roomOccupancyPercent = Math.round((roomStats.active / roomStats.total) * 100);
  
//   // Property data
//   const propertyStats = {
//     active: 8,
//     inactive: 2,
//     total: 10
//   };
  
//   const propertyOccupancyPercent = Math.round((propertyStats.active / propertyStats.total) * 100);

//   // Expenses data
//   const expenseStats = {
//     total: Math.round(stats.monthlyRevenue * 0.6),
//     fixed: Math.round(stats.monthlyRevenue * 0.3),
//     variable: Math.round(stats.monthlyRevenue * 0.3),
//     ratio: 70
//   };

//   // Income data
//   const incomeStats = {
//     total: stats.monthlyRevenue,
//     rental: Math.round(stats.monthlyRevenue * 0.85),
//     other: Math.round(stats.monthlyRevenue * 0.15),
//     ratio: 85
//   };

//   // Default occupancy percent
//   const occupancyPercent = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

//   useEffect(() => {
//     loadStats();
//   }, []);

//   useEffect(() => {
//     setAnimatedHeights([]);
//     const timers = rentActivityData.map((_, index) => {
//       return setTimeout(() => {
//         setAnimatedHeights(prev => {
//           if (!prev.includes(index)) {
//             return [...prev, index];
//           }
//           return prev;
//         });
//       }, index * 150);
//     });
//     return () => timers.forEach(timer => clearTimeout(timer));
//   }, []);

//   const loadStats = async () => {
//     setLoading(true);
//     try {
//       const [propsRes, roomsRes, tenantsRes, paymentsRes] = await Promise.all([
//         fetch(api.properties),
//         fetch(api.rooms),
//         fetch(api.tenants),
//         fetch(api.payments)
//       ]);

//       const [properties, rooms, tenants, payments] = await Promise.all([
//         propsRes.json(),
//         roomsRes.json(),
//         tenantsRes.json(),
//         paymentsRes.json()
//       ]);

//       const totalBeds = Array.isArray(properties)
//         ? properties.reduce((sum: number, p: any) => sum + (p.total_beds || 0), 0)
//         : 0;
//       const occupiedBeds = Array.isArray(properties)
//         ? properties.reduce((sum: number, p: any) => sum + (p.occupied_beds || 0), 0)
//         : 0;
//       const activeTenants = Array.isArray(tenants)
//         ? tenants.filter((t: any) => t.status === 'active').length
//         : 0;

//       const now = new Date();
//       const currentMonth = now.getMonth();
//       const currentYear = now.getFullYear();

//       const monthlyRevenue = Array.isArray(payments)
//         ? payments
//           .filter((p: any) => {
//             const date = p.payment_date ? new Date(p.payment_date) : null;
//             if (!date) return false;
//             return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
//           })
//           .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
//         : 0;

//       setStats({
//         totalProperties: Array.isArray(properties) ? properties.length : 0,
//         totalRooms: Array.isArray(rooms) ? rooms.length : 0,
//         totalBeds,
//         occupiedBeds,
//         totalTenants: Array.isArray(tenants) ? tenants.length : 0,
//         activeTenants,
//         monthlyRevenue,
//       });
//     } catch (err) {
//       console.error('Error loading stats:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== FILTER FUNCTIONS ====================
  
//   // Main filter application function
//   const applyRentActivityFilters = () => {
//     console.log('Rent Activity Filters Applied:', {
//       selectedYear,
//       selectedMonth,
//       selectedDate,
//       comparisonMode,
//       selectedYear1,
//       selectedYear2,
//       firstMonth,
//       firstYear,
//       secondMonth,
//       secondYear
//     });
    
    
//     setShowFilterPanel(false);
//     setShowComparisonDropdown(false);
//   };

//   const resetAllRentFilters = () => {
//     setSelectedMonth('January');
//     setSelectedYear('all');
//     setSelectedDate(null);
//     setComparisonMode('1year');
//     setSelectedYear1('');
//     setSelectedYear2('');
//     setFirstMonth('');
//     setFirstYear('');
//     setSecondMonth('');
//     setSecondYear('');
//     setCustomStartMonth('January');
//     setCustomEndMonth('December');
//     setCustomYear(new Date().getFullYear());
    
//     console.log('All filters reset');
    
//     // Here you would call your function to load default data
//     // loadDefaultRentData();
//   };

//   // Function to handle year selection from calendar
//   const handleYearSelect = (year: number) => {
//     setSelectedYear(year);
//     setShowYearCalendar(false);
//     // Apply filters automatically when year is selected
//     setTimeout(() => {
//       applyRentActivityFilters();
//     }, 100);
//   };

//   // Function to handle month selection
//   const handleMonthSelect = (month: string) => {
//     setSelectedMonth(month);
//     setShowMonthCalendar(false);
//     // Apply filters automatically when month is selected
//     setTimeout(() => {
//       applyRentActivityFilters();
//     }, 100);
//   };

//   // Function to handle date selection
//   const handleDateSelect = (date: Date) => {
//     setSelectedDate(date);
//     setShowDateCalendar(false);
//     // Apply filters automatically when date is selected
//     setTimeout(() => {
//       applyRentActivityFilters();
//     }, 100);
//   };

//   // ==================== END FILTER FUNCTIONS ====================

//   const getComparisonData = useMemo(() => {
//     return () => {
//       const currentYearData = [
//         { month: 'Jan', amount: 45000000 },
//         { month: 'Feb', amount: 52000000 },
//         { month: 'Mar', amount: 48000000 },
//         { month: 'Apr', amount: 61000000 },
//         { month: 'May', amount: 55000000 },
//         { month: 'Jun', amount: 68000000 },
//       ];
//       const previousYearData = [
//         { month: 'Jan', amount: 38000000 },
//         { month: 'Feb', amount: 42000000 },
//         { month: 'Mar', amount: 45000000 },
//         { month: 'Apr', amount: 52000000 },
//         { month: 'May', amount: 48000000 },
//         { month: 'Jun', amount: 60000000 },
//       ];
//       const customData = [
//         { month: customStartMonth.substring(0, 3), amount: 35000000 },
//         { month: customEndMonth.substring(0, 3), amount: 62000000 },
//       ];

//       switch (comparisonMode) {
//         case '2year':
//           return {
//             labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//             datasets: [
//               { data: currentYearData, label: `${typeof selectedYear === 'number' ? selectedYear : new Date().getFullYear()}`, color: 'from-blue-600 to-blue-400' },
//               { data: previousYearData, label: `${(typeof selectedYear === 'number' ? selectedYear : new Date().getFullYear()) - 1}`, color: 'from-green-600 to-green-400' }
//             ],
//             isComparison: true
//           };
//         case 'custom':
//           return {
//             labels: [customStartMonth.substring(0, 3), customEndMonth.substring(0, 3)],
//             datasets: [
//               { data: customData, label: `${customYear}`, color: 'from-purple-600 to-purple-400' }
//             ],
//             isComparison: false
//           };
//         default:
//           return {
//             labels: currentYearData.map(d => d.month),
//             datasets: [
//               { data: currentYearData, label: selectedYear === 'all' ? 'All Years' : `${selectedYear}`, color: 'from-blue-600 to-blue-400' }
//             ],
//             isComparison: false
//           };
//       }
//     };
//   }, [comparisonMode, selectedYear, customStartMonth, customEndMonth, customYear]);

//   const statCards = [
//     {
//       title: 'Total Properties',
//       value: stats.totalProperties,
//       icon: Building2,
//       color: 'from-blue-500 to-cyan-500',
//     },
//     {
//       title: 'Total Rooms',
//       value: stats.totalRooms,
//       icon: DoorOpen,
//       color: 'from-purple-500 to-pink-500',
//     },
//     {
//       title: 'Bed Occupancy',
//       value: `${stats.occupiedBeds}/${stats.totalBeds}`,
//       icon: Users,
//       color: 'from-green-500 to-emerald-500',
//     },
//     {
//       title: 'Active Tenants',
//       value: stats.activeTenants,
//       icon: Users,
//       color: 'from-orange-500 to-red-500',
//     },
//     {
//       title: 'Monthly Revenue',
//       value: `₹${stats.monthlyRevenue.toLocaleString()}`,
//       icon: CreditCard,
//       color: 'from-indigo-500 to-purple-500',
//     },
//   ];

//   const rentActivityData = [
//     { month: 'Jan', amount: 45000000 },
//     { month: 'Feb', amount: 52000000 },
//     { month: 'Mar', amount: 48000000 },
//     { month: 'Apr', amount: 61000000 },
//     { month: 'May', amount: 55000000 },
//     { month: 'Jun', amount: 68000000 },
//   ];

//   const comparisonData = getComparisonData();
//   const allAmounts = comparisonData.datasets.flatMap(dataset => 
//     dataset.data.map(d => d.amount)
//   );
//   const maxAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : 1;

//   const openFinancialTrend = () => {
//     setFinancialYear(selectedYear);
//     setFinancialMonth(selectedMonth);
//     setShowFinancialTrend(true);
//     setShowComparisonDropdown(false);
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const handleOccupancyFilterChange = (filter: DateFilterType) => {
//     setOccupancyDateFilter(filter);
//     if (filter === 'today') {
//       setOccupancySelectedDate(new Date());
//     } else if (filter === 'week') {
//       const startOfWeek = new Date();
//       startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
//       setOccupancySelectedDate(startOfWeek);
//     } else if (filter === 'month') {
//       const startOfMonth = new Date();
//       startOfMonth.setDate(1);
//       setOccupancySelectedDate(startOfMonth);
//     } else if (filter === 'year') {
//       const startOfYear = new Date();
//       startOfYear.setMonth(0, 1);
//       setOccupancySelectedDate(startOfYear);
//     } else if (filter === 'custom') {
//       // Custom date already selected via calendar
//     }
//   };

//   // Financial Trend Handlers
//   const handleFinancialTabChange = (tab: FinancialTab) => {
//     setFinancialTab(tab);
//   };

//   const handleChartTypeChange = (type: ChartType) => {
//     setChartType(type);
//   };

//   const handleFinancialYearChange = (year: number | 'all') => {
//     setFinancialYear(year);
//   };

//   return (
//     <div className="min-h-screen bg-blue-50 p-4">
//       {showFinancialTrend && (
//         <FinancialTrendChart 
//           summary={financialSummary}
//           activeTab={financialTab}
//           chartType={chartType}
//           selectedYear={financialYear}
//           selectedMonth={financialMonth}
//           onTabChange={handleFinancialTabChange}
//           onChartTypeChange={handleChartTypeChange}
//           onYearChange={handleFinancialYearChange}
//           onClose={() => setShowFinancialTrend(false)}
//         />
//       )}

//       {/* Calendar Modal */}
//       {showOccupancyCalendar && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
//             <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
//               <button
//                 onClick={() => setShowOccupancyCalendar(false)}
//                 className="p-1 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>

//             <div className="p-4 border-b border-gray-200">
//               <div className="flex items-center justify-between mb-4">
//                 <button
//                   onClick={() => {
//                     const newDate = new Date(occupancySelectedDate);
//                     newDate.setMonth(newDate.getMonth() - 1);
//                     setOccupancySelectedDate(newDate);
//                   }}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <ChevronLeft className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-800">
//                     {occupancySelectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     const newDate = new Date(occupancySelectedDate);
//                     newDate.setMonth(newDate.getMonth() + 1);
//                     setOccupancySelectedDate(newDate);
//                   }}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <ChevronRight className="w-5 h-5 text-gray-600" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//                   <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-7 gap-1">
//                 {Array.from({ length: 35 }).map((_, index) => {
//                   const day = index - new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth(), 1).getDay() + 1;
//                   const date = new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth(), day);
//                   const isToday = date.toDateString() === new Date().toDateString();
//                   const isSelected = date.toDateString() === occupancySelectedDate.toDateString();
                  
//                   return day > 0 && day <= new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth() + 1, 0).getDate() ? (
//                     <button
//                       key={index}
//                       onClick={() => {
//                         setOccupancySelectedDate(date);
//                         handleOccupancyFilterChange('custom');
//                         setShowOccupancyCalendar(false);
//                       }}
//                       className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
//                         isSelected ? 'bg-blue-600 text-white' :
//                         isToday ? 'bg-blue-100 text-blue-600' :
//                         'hover:bg-gray-100 text-gray-700'
//                       }`}
//                     >
//                       {day}
//                     </button>
//                   ) : (
//                     <div key={index} className="h-10" />
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="p-4 border-t border-gray-200">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Select</h4>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={() => {
//                     const today = new Date();
//                     setOccupancySelectedDate(today);
//                     handleOccupancyFilterChange('custom');
//                     setShowOccupancyCalendar(false);
//                   }}
//                   className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
//                 >
//                   Today
//                 </button>
//                 <button
//                   onClick={() => {
//                     const tomorrow = new Date();
//                     tomorrow.setDate(tomorrow.getDate() + 1);
//                     setOccupancySelectedDate(tomorrow);
//                     handleOccupancyFilterChange('custom');
//                     setShowOccupancyCalendar(false);
//                   }}
//                   className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
//                 >
//                   Tomorrow
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//           {statCards.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <Card
//                 key={index}
//                 className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
//               >
//                 <CardContent className="p-6">
//                   <div className="h-12 w-12 rounded-xl bg-blue-800 flex items-center justify-center shadow-md mb-4">
//                     <Icon className="h-6 w-6 text-white" />
//                   </div>
//                   <p className="text-sm text-slate-600 mb-1">
//                     {stat.title}
//                   </p>
//                   <h3 className="text-2xl font-bold text-slate-900">
//                     {stat.value}
//                   </h3>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* OCCUPANCY OVERVIEW WITH TWO-STEP FILTER */}
//         <Card className="border-0 shadow-lg">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-xl font-bold text-slate-700">
//                 {selectedType === 'tents' ? 'Tents Overview' : 
//                  selectedType === 'rooms' ? 'Rooms Overview' : 
//                  selectedType === 'property' ? 'Property Overview' : 
//                  selectedType === 'expenses' ? 'Expenses Overview' :
//                  selectedType === 'income' ? 'Income Overview' :
//                  'Occupancy Overview'}
//               </CardTitle>
              
//               <div className="flex items-center gap-2">
//                 {/* Compact Filter Button */}
//                 <div className="relative">
//                   <button
//                     onClick={() => {
//                       setShowFilter(!showFilter);
//                       if (showTypeMenu) setShowTypeMenu(false);
//                     }}
//                     className="
//                       flex items-center gap-2
//                       px-3 py-1.5
//                       bg-white
//                       border border-blue-200
//                       rounded-lg
//                       text-sm font-medium text-blue-700
//                       hover:bg-blue-50
//                       hover:border-blue-300
//                       focus:outline-none focus:ring-2 focus:ring-blue-200
//                       transition-all duration-200
//                       shadow-sm
//                     "
//                   >
//                     <Calendar className="w-4 h-4 text-blue-600" />
//                     <span className="whitespace-nowrap">
//                       {selectedMonth.substring(0, 3)} , {selectedYear === 'all' ? 'All Years' : selectedYear}
//                     </span>
//                     <ChevronDown
//                       className={`w-3 h-3 text-blue-700 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`}
//                     />
//                   </button>
                  
//                   {/* Filter Dropdown - Compact */}
//                   {showFilter && (
//                     <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
//                       <div className="p-2 border-b border-gray-100">
//                         <h4 className="text-xs font-semibold text-gray-800">
//                           Filter Dates
//                         </h4>
//                       </div>

//                       <div className="p-2 space-y-3">
//                         <div className="flex items-end gap-2">
//                           <div className="flex-1">
//                             <label className="text-xs font-medium text-gray-700 mb-1 block">
//                               start Date
//                             </label>
//                             <input
//                               type="text"
//                               placeholder="DD/MM/YYYY"
//                               value={startDateDisplay}
//                               onFocus={() => setIsSelectingStartDate(true)}
//                               className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                               size={10}
//                             />
//                           </div>
                          
//                           <div className="pb-1">
//                             <span className="text-gray-400">→</span>
//                           </div>
                          
//                           <div className="flex-1">
//                             <label className="text-xs font-medium text-gray-700 mb-1 block">
//                               End Date
//                             </label>
//                             <input
//                               type="text"
//                               placeholder="DD/MM/YYYY"
//                               value={endDateDisplay}
//                               onFocus={() => setIsSelectingEndDate(true)}
//                               className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
//                               size={10}
//                             />
//                           </div>
//                         </div>

//                         <div className="flex gap-2">
//                           <div className="flex-1">
//                             <select
//                               value={selectedMonth}
//                               onChange={(e) => {
//                                 setSelectedMonth(e.target.value);
//                                 // Auto-apply filter when month changes
//                                 setTimeout(() => {
//                                   // Call your filter function here
//                                   console.log('Month filter applied:', e.target.value);
//                                 }, 100);
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                             >
//                               {allMonths.map(month => (
//                                 <option key={month} value={month}>{month.substring(0, 3)}</option>
//                               ))}
//                             </select>
//                           </div>
                          
//                           <div className="flex-1 relative">
//                             <select
//                               value={selectedYear}
//                               onChange={(e) => {
//                                 const value = e.target.value;
//                                 setSelectedYear(value === 'all' ? 'all' : parseInt(value));
//                                 // Auto-apply filter when year changes
//                                 setTimeout(() => {
//                                   console.log('Year filter applied:', value);
//                                 }, 100);
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
//                             >
//                               <option value="all">All Years</option>
//                               {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
//                                 <option key={year} value={year}>{year}</option>
//                               ))}
//                             </select>
//                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
//                               <ChevronDown className="w-3 h-3" />
//                             </div>
//                           </div>
//                         </div>

//                         <div className="border border-gray-200 rounded overflow-hidden">
//                           <div className="grid grid-cols-7 bg-gray-50">
//                             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
//                               <div key={index} className="text-xs font-medium text-gray-600 py-1.5 text-center border-r border-gray-200 last:border-r-0">
//                                 {day}
//                               </div>
//                             ))}
//                           </div>
                          
//                           <div className="grid grid-cols-7 bg-white">
//                             {(() => {
//                               const year = selectedYear === 'all' ? new Date().getFullYear() : selectedYear;
//                               const monthIndex = allMonths.indexOf(selectedMonth);
//                               const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
//                               const firstDay = new Date(year, monthIndex, 1).getDay();
//                               const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
//                               const days = [];
                              
//                               for (let i = 0; i < firstDayAdjusted; i++) {
//                                 days.push(<div key={`empty-${i}`} className="h-7 border-r border-b border-gray-100 bg-gray-50"></div>);
//                               }
                              
//                               for (let day = 1; day <= daysInMonth; day++) {
//                                 const currentDate = new Date(year, monthIndex, day);
//                                 const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//                                 const displayDate = `${String(day).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`;
                                
//                                 const isStartDate = startDateDisplay && startDateDisplay.replace(/-/g, '/') === displayDate;
//                                 const isEndDate = endDateDisplay && endDateDisplay.replace(/-/g, '/') === displayDate;
                                
//                                 days.push(
//                                   <button 
//                                     key={day}
//                                     onClick={() => {
//                                       const formattedDate = `${String(day).padStart(2, '0')}-${String(monthIndex + 1).padStart(2, '0')}-${year}`;
                                      
//                                       if (isSelectingStartDate) {
//                                         setStartDateDisplay(formattedDate);
//                                         setStartDate(dateStr);
//                                         setIsSelectingStartDate(false);
//                                       } else if (isSelectingEndDate) {
//                                         setEndDateDisplay(formattedDate);
//                                         setEndDate(dateStr);
//                                         setIsSelectingEndDate(false);
//                                       } else {
//                                         setIsSelectingStartDate(true);
//                                         setStartDateDisplay(formattedDate);
//                                         setStartDate(dateStr);
//                                       }
//                                     }}
//                                     className={`
//                                       h-7 border-r border-b border-gray-100 text-[10px]
//                                       flex items-center justify-center transition-colors
//                                       ${isStartDate ? 'bg-blue-600 text-white' : 
//                                         isEndDate ? 'bg-green-600 text-white' : 
//                                         'hover:bg-gray-50 text-gray-700'}
//                                       ${(firstDayAdjusted + day) % 7 === 0 ? 'border-r-0' : ''}
//                                     `}
//                                   >
//                                     {day}
//                                   </button>
//                                 );
//                               }
                              
//                               return days;
//                             })()}
//                           </div>
//                         </div>

//                         <div className="flex gap-1.5">
//                           <button
//                             onClick={() => {
//                               const today = new Date();
//                               const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
//                               const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                              
//                               if (!startDate) {
//                                 setStartDateDisplay(todayStr);
//                                 setStartDate(todayDateStr);
//                               } else if (!endDate) {
//                                 setEndDateDisplay(todayStr);
//                                 setEndDate(todayDateStr);
//                               }
//                             }}
//                             className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
//                           >
//                             Today
//                           </button>
                          
//                           <button
//                             onClick={() => {
//                               setStartDateDisplay('');
//                               setEndDateDisplay('');
//                               setStartDate('');
//                               setEndDate('');
//                             }}
//                             className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
//                           >
//                             Clear
//                           </button>
//                         </div>

//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => {
//                               if (startDate && endDate) {
//                                 handleOccupancyFilterChange('custom');
//                                 setShowFilter(false);
//                                 // Call your filter function here
//                                 console.log('Date range filter applied:', { startDate, endDate });
//                               }
//                             }}
//                             className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                             disabled={!startDate || !endDate}
//                           >
//                             Apply
//                           </button>

//                           <button
//                             onClick={() => {
//                               setSelectedMonth('January');
//                               setSelectedYear('all');
//                               setStartDate('');
//                               setEndDate('');
//                               setStartDateDisplay('');
//                               setEndDateDisplay('');
//                             }}
//                             className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
//                           >
//                             Reset
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 {/* 3 Dots Type Selector Button and Back Button */}
//                 <div className="flex items-center gap-2">
//                   {selectedType && (
//                     <button
//                       onClick={() => setSelectedType('')}
//                       className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 border border-grey-300 rounded-lg text-white transition-colors shadow-sm text-xs font-medium"
//                     >
//                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
//                       </svg>
//                     </button>
//                   )}
                  
//                   <div className="relative">
//                     <button
//                       onClick={() => {
//                         setShowTypeMenu(!showTypeMenu);
//                         if (showFilter) setShowFilter(false);
//                       }}
//                       className="flex items-center justify-center w-8 h-8 bg-blue-700 border border-gray-300 rounded-lg text-white hover:bg-blue-500 transition-colors shadow-sm"
//                     >
//                       <MoreVertical className="w-5 h-4" />
//                     </button>
                    
//                     {/* Type Menu Dropdown with Expenses and Income */}
//                     {showTypeMenu && (
//                       <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
//                         <div className="p-2.5">
//                           <div className="grid grid-cols-3 gap-1.5">
//                             {/* Tents */}
//                             <button 
//                               className="w-full p-1.5 text-gray-800 hover:bg-blue-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
//                               onClick={() => {
//                                 setSelectedType('tents');
//                                 setShowTypeMenu(false);
//                               }}
//                               title="Tents"
//                             >
//                               <div className="w-7 h-7 flex items-center justify-center bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-200">
//                                 <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
//                                 </svg>
//                               </div>
//                               <span className="text-[10px] font-semibold text-gray-800">Tents</span>
//                             </button>
                            
//                             {/* Rooms */}
//                             <button 
//                               className="w-full p-1.5 text-gray-800 hover:bg-emerald-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
//                               onClick={() => {
//                                 setSelectedType('rooms');
//                                 setShowTypeMenu(false);
//                               }}
//                               title="Rooms"
//                             >
//                               <div className="w-7 h-7 flex items-center justify-center bg-emerald-100 rounded-full group-hover:scale-110 transition-transform duration-200">
//                                 <svg className="w-3.5 h-3.5 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
//                                 </svg>
//                               </div>
//                               <span className="text-[10px] font-semibold text-gray-800">Rooms</span>
//                             </button>
                            
//                             {/* Property */}
//                             <button 
//                               className="w-full p-1.5 text-gray-800 hover:bg-violet-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
//                               onClick={() => {
//                                 setSelectedType('property');
//                                 setShowTypeMenu(false);
//                               }}
//                               title="Property"
//                             >
//                               <div className="w-7 h-7 flex items-center justify-center bg-violet-100 rounded-full group-hover:scale-110 transition-transform duration-200">
//                                 <svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//                                 </svg>
//                               </div>
//                               <span className="text-[10px] font-semibold text-gray-800">Property</span>
//                             </button>
                            
//                             {/* Expenses */}
//                             <button 
//                               className="w-full p-1.5 text-gray-800 hover:bg-amber-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
//                               onClick={() => {
//                                 setSelectedType('expenses');
//                                 setShowTypeMenu(false);
//                               }}
//                               title="Expenses"
//                             >
//                               <div className="w-7 h-7 flex items-center justify-center bg-amber-100 rounded-full group-hover:scale-110 transition-transform duration-200">
//                                 <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
//                                 </svg>
//                               </div>
//                               <span className="text-[10px] font-semibold text-gray-800">Expenses</span>
//                             </button>
                            
//                             {/* Income */}
//                             <button 
//                               className="w-full p-1.5 text-gray-800 hover:bg-green-50 rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group"
//                               onClick={() => {
//                                 setSelectedType('income');
//                                 setShowTypeMenu(false);
//                               }}
//                               title="Income"
//                             >
//                               <div className="w-7 h-7 flex items-center justify-center bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-200">
//                                 <svg className="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                                 </svg>
//                               </div>
//                               <span className="text-[10px] font-semibold text-gray-800">Income</span>
//                             </button>
                            
                            
//                             {/* Empty space for future items */}
//                             <div className="w-full p-1.5 opacity-0 cursor-default">
//                               <div className="w-7 h-7"></div>
//                               <span className="text-[10px]">&nbsp;</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent>
//             <div className="flex flex-col items-center">
//               {/* Chart Image based on selected type */}
//               <div className="relative w-40 h-40 mb-6">
//                 {selectedType === 'tents' ? (
//                   // Tents Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-green-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #10B981 ${tentOccupancyPercent * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center ">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {tentOccupancyPercent}%
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1">Occupied Tents</span>
//                     </div>
//                   </>
//                 ) : selectedType === 'rooms' ? (
//                   // Rooms Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-purple-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #8B5CF6 ${roomOccupancyPercent * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {roomOccupancyPercent}%
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1 ml-4">Occupied Rooms</span>
//                     </div>
//                   </>
//                 ) : selectedType === 'property' ? (
//                   // Property Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-red-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #EF4444 ${propertyOccupancyPercent * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {propertyOccupancyPercent}%
//                       </span>
//                       <span className="text-sm text-gray-500 ml-4">Occupied Property</span>
//                     </div>
//                   </>
//                 ) : selectedType === 'expenses' ? (
//                   // Expenses Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-orange-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #EF4444 ${expenseStats.ratio * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {expenseStats.ratio}%
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1">Expenses Ratio</span>
//                     </div>
//                   </>
//                 ) : selectedType === 'income' ? (
//                   // Income Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-green-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #10B981 ${incomeStats.ratio * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {incomeStats.ratio}%
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1">Income Ratio</span>
//                     </div>
//                   </>
//                 ) : (
//                   // Default Beds Chart
//                   <>
//                     <div className="absolute inset-0 rounded-full bg-yellow-300"></div>
//                     <div className="absolute inset-0 rounded-full">
//                       <div
//                         className="absolute inset-0 rounded-full"
//                         style={{
//                           background: `conic-gradient(
//                             #3B82F6 ${occupancyPercent * 3.6}deg,
//                             transparent 0deg
//                           )`
//                         }}
//                       />
//                     </div>
//                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
//                       <span className="text-3xl font-bold text-slate-800">
//                         {occupancyPercent}%
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1">Occupied</span>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Active/Inactive Status Section */}
//               {selectedType === 'tents' ? (
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-green-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Active Tents</p>
//                         <p className="text-xs text-gray-500">Currently occupied</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-green-600">{tentStats.active}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-red-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Inactive Tents</p>
//                         <p className="text-xs text-gray-500">Vacant or closed</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-red-600">{tentStats.inactive}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//                         </svg>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Total Tents</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-gray-800">{tentStats.total}</p>
//                   </div>
//                 </div>
//               ) : selectedType === 'rooms' ? (
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-purple-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Active Rooms</p>
//                         <p className="text-xs text-gray-500">Currently occupied</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-purple-600">{roomStats.active}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-orange-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Inactive Rooms</p>
//                         <p className="text-xs text-gray-500">Vacant or closed</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-orange-600">{roomStats.inactive}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//                         </svg>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Total Rooms</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-gray-800">{roomStats.total}</p>
//                   </div>
//                 </div>
//               ) : selectedType === 'property' ? (
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-red-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Active Properties</p>
//                         <p className="text-xs text-gray-500">Currently occupied</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-red-600">{propertyStats.active}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-blue-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Inactive Properties</p>
//                         <p className="text-xs text-gray-500">Vacant or closed</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-blue-600">{propertyStats.inactive}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//                         </svg>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Total Properties</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-gray-800">{propertyStats.total}</p>
//                   </div>
//                 </div>
//               ) : selectedType === 'expenses' ? (
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
//                         <TrendingDown className="w-4 h-4 text-red-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Monthly Expenses</p>
//                         <p className="text-xs text-gray-500">Total spent this month</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-red-600">₹{expenseStats.total.toLocaleString()}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
//                         <FileText className="w-4 h-4 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Fixed Costs</p>
//                         <p className="text-xs text-gray-500">Rent, utilities, etc.</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-orange-600">₹{expenseStats.fixed.toLocaleString()}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                         <Receipt className="w-4 h-4 text-gray-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Variable Costs</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-gray-800">₹{expenseStats.variable.toLocaleString()}</p>
//                   </div>
//                 </div>
//               ) : selectedType === 'income' ? (
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
//                         <TrendingUp className="w-4 h-4 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Monthly Income</p>
//                         <p className="text-xs text-gray-500">Total earned this month</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-green-600">₹{incomeStats.total.toLocaleString()}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                         <Users className="w-4 h-4 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Rental Income</p>
//                         <p className="text-xs text-gray-500">From tenants</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-blue-600">₹{incomeStats.rental.toLocaleString()}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
//                         <DollarSign className="w-4 h-4 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Other Income</p>
//                         <p className="text-xs text-gray-500">Services, fees, etc.</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-purple-600">₹{incomeStats.other.toLocaleString()}</p>
//                   </div>
//                 </div>
//               ) : (
//                 // Default Beds view
//                 <div className="w-full space-y-4">
//                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-blue-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Occupied Beds</p>
//                         <p className="text-xs text-gray-500">Currently in use</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-blue-600">{stats.occupiedBeds}</p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
//                         <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Available Beds</p>
//                         <p className="text-xs text-gray-500">Ready for occupancy</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-yellow-600">
//                       {Math.max(0, stats.totalBeds - stats.occupiedBeds)}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                         <Users className="w-4 h-4 text-gray-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-700">Total Beds</p>
//                       </div>
//                     </div>
//                     <p className="text-xl font-bold text-gray-800">{stats.totalBeds}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* RENT ACTIVITY OVER TIME (with working filters) */}
//        <Card className="border-0 shadow-lg lg:col-span-2 relative overflow-hidden">
//   <CardHeader className="pb-3">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-2">
//         {/* Trends button REMOVED - Only in dropdown */}
        
//         <div className="relative">
//           <button 
//             onClick={() => setShowComparisonDropdown(!showComparisonDropdown)}
//             className="p-2 hover:bg-blue-50 rounded-lg"
//           >
//             <MoreVertical className="w-5 h-5 text-blue-600" />
//           </button>
          
//           {showComparisonDropdown && (
//             <div className="absolute left-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
//               <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-bold text-gray-800 text-sm">Compare Data</h3>
//                     <p className="text-xs text-gray-500 mt-0.5">Select comparison type</p>
//                   </div>
//                   <button
//                     onClick={() => setShowComparisonDropdown(false)}
//                     className="p-1 hover:bg-gray-100 rounded-lg"
//                   >
//                     <X className="w-4 h-4 text-gray-500" />
//                   </button>
//                 </div>
                
//                 {/* Quick Actions */}
//                 <div className="flex gap-2 mt-3">
//                   <button
//                     onClick={openFinancialTrend}
//                     className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 rounded-lg text-xs font-medium border border-blue-200 flex items-center justify-center gap-1.5"
//                   >
//                     <LineChart className="w-3.5 h-3.5" />
//                     <span>Trends</span>
//                   </button>
                  
//                   <button
//                     onClick={() => {
//                       setSelectedYear1('');
//                       setSelectedYear2('');
//                       setFirstMonth('');
//                       setFirstYear('');
//                       setSecondMonth('');
//                       setSecondYear('');
//                       setComparisonMode('1year');
//                       setShowComparisonDropdown(false);
//                     }}
//                     className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300 flex items-center justify-center gap-1.5"
//                   >
//                     <RefreshCw className="w-3.5 h-3.5" />
//                     <span>Reset</span>
//                   </button>
//                 </div>
//               </div>
              
//               <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto 
//                 [&::-webkit-scrollbar]:w-2
//                 [&::-webkit-scrollbar-track]:bg-transparent
//                 [&::-webkit-scrollbar-thumb]:bg-gray-300
//                 [&::-webkit-scrollbar-thumb]:rounded-full
//                 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
//                 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
//                 {/* 1 Year View */}
//                 <button
//                   onClick={() => {
//                     setComparisonMode('1year');
//                     setShowComparisonDropdown(false);
//                     // Apply filters when mode changes
//                     setTimeout(() => {
//                       applyRentActivityFilters();
//                     }, 100);
//                   }}
//                   className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                     comparisonMode === '1year'
//                       ? 'bg-blue-50 text-blue-700 border border-blue-200'
//                       : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                       <span>Single Year</span>
//                     </div>
//                     {comparisonMode === '1year' && <Check className="w-3.5 h-3.5 text-blue-500" />}
//                   </div>
//                 </button>

//                 {/* 2 Year Comparison */}
//                 <div className="space-y-2">
//                   <button
// onClick={() => setComparisonMode(comparisonMode === '2year' ? null : '2year')}
//                     className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                       comparisonMode === '2year'
//                         ? 'bg-green-50 text-green-700 border border-green-200'
//                         : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="flex gap-0.5">
//                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                           <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                         </div>
//                         <span>Compare Years</span>
//                       </div>
//                       <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === '2year' ? 'rotate-180' : ''}`} />
//                     </div>
//                   </button>
                  
//                   {comparisonMode === '2year' && (
//                     <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 space-y-3">
//                       <div className="grid grid-cols-2 gap-2">
//                         <div>
//                           <label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label>
//                           <div className="relative">
//                             <select
//                               value={selectedYear1 || ""}
//                               onChange={(e) => {
//                                 setSelectedYear1(e.target.value);
//                                 // Auto-apply when year1 changes
//                                 if (e.target.value && selectedYear2) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
//                             >
//                               <option value="">Choose year</option>
//                               {allAvailableYears.map(year => (
//                                 <option key={year} value={year}>{year}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
                        
//                         <div>
//                           <label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label>
//                           <div className="relative">
//                             <select
//                               value={selectedYear2 || ""}
//                               onChange={(e) => {
//                                 setSelectedYear2(e.target.value);
//                                 // Auto-apply when year2 changes
//                                 if (e.target.value && selectedYear1) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"
//                             >
//                               <option value="">Choose year</option>
//                               {allAvailableYears.map(year => (
//                                 <option key={year} value={year}>{year}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <button
//                         onClick={() => {
//                           if (selectedYear1 && selectedYear2) {
//                             applyRentActivityFilters();
//                           }
//                         }}
//                         className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                         disabled={!selectedYear1 || !selectedYear2}
//                       >
//                         Apply Filter
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Compare 2 Months */}
//                 <div className="space-y-2">
//                   <button
// onClick={() => setComparisonMode(comparisonMode === '2year' ? null : '2year')}
//                     className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
//                       comparisonMode === 'custom'
//                         ? 'bg-purple-50 text-purple-700 border border-purple-200'
//                         : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                         <span>Compare Months</span>
//                       </div>
//                       <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode === 'custom' ? 'rotate-180' : ''}`} />
//                     </div>
//                   </button>
                  
//                   {comparisonMode === 'custom' && (
//                     <div className="bg-purple-50/30 rounded-lg border border-purple-100">
//                       <div className="p-3 space-y-3">
//                         {/* Compact Month Selection Form */}
//                         <div className="space-y-3">
//                           {/* First Row: Labels */}
//                           <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700">
//                             <div>Month 1</div>
//                             <div>Month 2</div>
//                           </div>
                          
//                           {/* Second Row: Month Dropdowns */}
//                           <div className="grid grid-cols-2 gap-2">
//                             <select
//                               value={firstMonth || ""}
//                               onChange={(e) => {
//                                 setFirstMonth(e.target.value);
//                                 // Auto-apply when both months and years are selected
//                                 if (e.target.value && firstYear && secondMonth && secondYear) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                             >
//                               <option value="">Select Month</option>
//                               {allMonths.map(month => (
//                                 <option key={`first-${month}`} value={month}>{month.substring(0, 3)}</option>
//                               ))}
//                             </select>
                            
//                             <select
//                               value={secondMonth || ""}
//                               onChange={(e) => {
//                                 setSecondMonth(e.target.value);
//                                 // Auto-apply when both months and years are selected
//                                 if (e.target.value && secondYear && firstMonth && firstYear) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                             >
//                               <option value="">Select Month</option>
//                               {allMonths.map(month => (
//                                 <option key={`second-${month}`} value={month}>{month.substring(0, 3)}</option>
//                               ))}
//                             </select>
//                           </div>
                          
//                           {/* Third Row: Year Dropdowns */}
//                           <div className="grid grid-cols-2 gap-2">
//                             <select
//                               value={firstYear || ""}
//                               onChange={(e) => {
//                                 setFirstYear(e.target.value);
//                                 // Auto-apply when both months and years are selected
//                                 if (e.target.value && firstMonth && secondMonth && secondYear) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                             >
//                               <option value="">Year</option>
//                               {allAvailableYears.map(year => (
//                                 <option key={`first-${year}`} value={year}>{year}</option>
//                               ))}
//                             </select>
                            
//                             <select
//                               value={secondYear || ""}
//                               onChange={(e) => {
//                                 setSecondYear(e.target.value);
//                                 // Auto-apply when both months and years are selected
//                                 if (e.target.value && secondMonth && firstMonth && firstYear) {
//                                   setTimeout(() => {
//                                     applyRentActivityFilters();
//                                   }, 100);
//                                 }
//                               }}
//                               className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"
//                             >
//                               <option value="">Year</option>
//                               {allAvailableYears.map(year => (
//                                 <option key={`second-${year}`} value={year}>{year}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>

//                         {/* Selected Preview */}
//                         {(firstMonth || secondMonth) && (
//                           <div className="p-2 bg-purple-100/30 rounded border border-purple-100">
//                             <div className="text-xs text-center">
//                               <span className="font-medium text-purple-700">
//                                 {firstMonth && firstYear ? `${firstMonth.substring(0, 3)} ${firstYear}` : "___"}
//                               </span>
//                               <span className="mx-2 text-gray-400">vs</span>
//                               <span className="font-medium text-purple-700">
//                                 {secondMonth && secondYear ? `${secondMonth.substring(0, 3)} ${secondYear}` : "___"}
//                               </span>
//                             </div>
//                           </div>
//                         )}

//                         {/* Action Buttons */}
//                         <div className="flex gap-2 pt-2">
//                           <button
//                             onClick={() => {
//                               setFirstMonth('');
//                               setFirstYear('');
//                               setSecondMonth('');
//                               setSecondYear('');
//                             }}
//                             className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
//                           >
//                             Clear
//                           </button>
                          
//                           <button
//                             onClick={() => {
//                               const today = new Date();
//                               const currentMonth = allMonths[today.getMonth()];
//                               const currentYear = today.getFullYear().toString();
                              
//                               setFirstMonth(currentMonth);
//                               setFirstYear(currentYear);
                              
//                               const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//                               const prevMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
//                               setSecondMonth(allMonths[prevMonth]);
//                               setSecondYear(prevMonthYear.toString());
                              
//                               // Auto-apply after setting recent data
//                               setTimeout(() => {
//                                 applyRentActivityFilters();
//                               }, 100);
//                             }}
//                             className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
//                           >
//                             Recent
//                           </button>
                          
//                           <button
//                             onClick={() => {
//                               if (firstMonth && firstYear && secondMonth && secondYear) {
//                                 applyRentActivityFilters();
//                               }
//                             }}
//                             className="flex-1 px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
//                             disabled={!firstMonth || !firstYear || !secondMonth || !secondYear}
//                           >
//                             Apply
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         <div>
//           <CardTitle className="text-xl font-semibold text-gray-800">
//             Rent Activity Over Time
//           </CardTitle>
//           <div className="flex items-center gap-2 mt-1">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500">Showing:</span>
//               <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
//                 {comparisonMode === '1year' && (selectedYear === 'all' ? 'All Years' : `${selectedYear}`)}
//                 {comparisonMode === '2year' && `${selectedYear1 || 'Year 1'} vs ${selectedYear2 || 'Year 2'}`}
//                 {comparisonMode === 'custom' && `${firstMonth ? firstMonth.substring(0, 3) : '___'} ${firstYear || ''} vs ${secondMonth ? secondMonth.substring(0, 3) : '___'} ${secondYear || ''}`}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <button 
//         onClick={() => setShowFilterPanel(!showFilterPanel)}
//         className="p-2 hover:bg-blue-50 rounded-lg transition-colors group relative"
//       >
//         <Filter className="w-5 h-5 text-blue-600" />
//         {showFilterPanel && (
//           <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
//         )}
//       </button>
//     </div>
//   </CardHeader>
  
//   <div className="flex relative">
//     <div className={`transition-all duration-300 ${showFilterPanel ? 'w-3/4 pr-4' : 'w-full'}`}>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <span className="text-sm font-medium text-gray-700">Amount (₹)</span>
//             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
//               <TrendingUp className="w-4 h-4 text-green-600" />
//               <span className="text-sm font-medium text-green-600">+12.5%</span>
//             </div>
//           </div>

//           {comparisonMode === '2year' && (
//             <div className="flex items-center gap-4">
//               {comparisonData.datasets.map((dataset, idx) => (
//                 <div key={idx} className="flex items-center gap-2">
//                   <div className={`w-3 h-3 rounded-full ${
//                     idx === 0 ? 'bg-blue-500' : 'bg-green-500'
//                   }`}></div>
//                   <span className="text-xs font-medium text-gray-700">{dataset.label}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="relative h-52">
//             <div className="absolute inset-0 flex flex-col justify-between">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <div key={i} className="border-t border-gray-200"></div>
//               ))}
//             </div>

//             <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
//               <span className="font-medium">₹{maxAmount.toLocaleString()}</span>
//               <span>₹{Math.round(maxAmount * 0.75).toLocaleString()}</span>
//               <span>₹{Math.round(maxAmount * 0.5).toLocaleString()}</span>
//               <span>₹{Math.round(maxAmount * 0.25).toLocaleString()}</span>
//               <span className="font-medium">₹0</span>
//             </div>

//             <div className="absolute bottom-0 left-10 right-2 h-44 flex items-end justify-between">
//               {comparisonData.labels.map((label, index) => {
//                 if (comparisonMode === '2year') {
//                   const dataset1 = comparisonData.datasets[0];
//                   const dataset2 = comparisonData.datasets[1];
//                   const item1 = dataset1.data[index];
//                   const item2 = dataset2.data[index];
//                   const height1 = (item1.amount / maxAmount) * 85;
//                   const height2 = (item2.amount / maxAmount) * 85;
//                   const isAnimated = animatedHeights.includes(index);
                  
//                   return (
//                     <div key={index} className="flex flex-col items-center flex-1 mx-1">
//                       <div className="relative h-44 w-full flex items-end justify-center">
//                         <div className="flex items-end justify-center w-full gap-1">
//                           <div 
//                             className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative "
//                             style={{ 
//                               height: isAnimated ? `${height1}%` : '0%',
//                               minHeight: isAnimated ? '20px' : '0px',
//                               transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
//                             }}
//                           >
//                             <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
//                               <div className="font-semibold">₹{item1.amount.toLocaleString()}</div>
//                               <div className="text-gray-300 text-xs">{dataset1.label}</div>
//                             </div>
//                           </div>
                          
//                           <div 
//                             className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative group hover:opacity-90 "
//                             style={{ 
//                               height: isAnimated ? `${height2}%` : '0%',
//                               minHeight: isAnimated ? '20px' : '0px',
//                               transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
//                             }}
//                           >
//                             <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
//                               <div className="font-semibold">₹{item2.amount.toLocaleString()}</div>
//                               <div className="text-gray-300 text-xs">{dataset2.label}</div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <span className="text-sm font-medium text-gray-700 mt-2">
//                         {label}
//                       </span>
//                     </div>
//                   );
//                 }
                
//                 const dataset = comparisonData.datasets[0];
//                 const item = dataset.data[index];
//                 const height = (item.amount / maxAmount) * 85;
//                 const isAnimated = animatedHeights.includes(index);
                
//                 return (
//                   <div key={index} className="flex flex-col items-center flex-1 mx-1">
//                     <div className="relative h-44 w-full flex items-end justify-center">
//                       <div 
//                         className={`w-14 bg-gradient-to-t ${dataset.color} rounded-t-lg relative group hover:opacity-90 hover:shadow-lg`}
//                         style={{ 
//                           height: isAnimated ? `${height}%` : '0%',
//                           minHeight: isAnimated ? '20px' : '0px',
//                           transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), min-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
//                         }}
//                       >
//                         <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
//                             <div className="font-semibold">₹{item.amount.toLocaleString()}</div>
//                             <div className="text-gray-300 text-xs">{item.month}</div>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <span className="text-sm font-medium text-gray-700 mt-2">
//                       {label}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="pt-2 border-t">
//             <span className="text-sm font-medium text-gray-700">Months</span>
            
//             <div className="flex justify-between items-center mt-4">
//               <div>
//                 <p className="text-sm text-gray-600">
//                   {comparisonMode === '1year' ? (selectedYear === 'all' ? 'All Years' : 'Current Year') : 
//                   comparisonMode === '2year' ? 'Current Year' : 'Custom Range'}
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   ₹{comparisonData.datasets[0]?.data[comparisonData.datasets[0].data.length - 1]?.amount?.toLocaleString() || '0'}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-gray-600">Average</p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {comparisonData.datasets.map((dataset, idx) => {
//                     const avg = dataset.data.length > 0 
//                       ? Math.round(dataset.data.reduce((sum, d) => sum + d.amount, 0) / dataset.data.length)
//                       : 0;
//                     return (
//                       <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
//                         ₹{avg.toLocaleString()} {comparisonData.datasets.length > 1 && `(${dataset.label})`}
//                       </div>
//                     );
//                   })}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </div>

//     {/* FILTER PANEL (with working filters) */}
//     <div 
//       className={`absolute right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
//         showFilterPanel ? 'w-1/4 translate-x-0' : 'w-0 translate-x-full'
//       }`}
//     >
//       <div className="h-full overflow-y-auto p-4">
//         <div className="mb-4 pb-3 border-b border-gray-100">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Filter className="w-4 h-4 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-800 text-sm">Filter Analytics</h3>
//                 <p className="text-xs text-gray-500">Customize your view</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mb-4">
//           <h4 className="text-xs font-semibold text-gray-700 mb-2">Year</h4>
          
//           <div className="relative">
//             <button
//               onClick={() => setShowYearCalendar(!showYearCalendar)}
//               className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
//             >
//               <span className={`${selectedYear === 'all' ? 'text-xs text-gray-600' : 'text-sm text-gray-800 font-medium'}`}>
//                 {selectedYear === 'all' ? 'All Years' : selectedYear}
//               </span>
//               <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showYearCalendar ? 'rotate-180' : ''}`} />
//             </button>

//             {showYearCalendar && (
//               <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
//                 <div className="flex items-center justify-between mb-3 px-1">
//                   <button
//                     onClick={() => setYearRange(prev => prev - 6)}
//                     className="p-1.5 hover:bg-gray-100 rounded"
//                   >
//                     <ChevronLeft className="w-4 h-4 text-gray-600" />
//                   </button>
//                   <span className="text-sm font-medium text-gray-700">
//                     {yearRange} - {yearRange + 5}
//                   </span>
//                   <button
//                     onClick={() => setYearRange(prev => prev + 6)}
//                     className="p-1.5 hover:bg-gray-100 rounded"
//                   >
//                     <ChevronRight className="w-4 h-4 text-gray-600" />
//                   </button>
//                 </div>
                
//                 <div className="grid grid-cols-3 gap-1.5">
//                   {Array.from({ length: 6 }, (_, i) => yearRange + i).map(year => (
//                     <button
//                       key={year}
//                       onClick={() => handleYearSelect(year)}
//                       className={`
//                         py-2 text-xs rounded transition-all
//                         ${selectedYear === year
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
//                         }
//                       `}
//                     >
//                       {year}
//                     </button>
//                   ))}
//                 </div>
                
//                 <div className="mt-2 pt-2 border-t border-gray-200">
//                   <button
//                     onClick={() => {
//                       setSelectedYear('all');
//                       setShowYearCalendar(false);
//                       // Apply filters automatically
//                       setTimeout(() => {
//                         applyRentActivityFilters();
//                       }, 100);
//                     }}
//                     className={`
//                       w-full py-2 text-xs rounded
//                       ${selectedYear === 'all'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }
//                     `}
//                   >
//                     All Years
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="mb-4">
//           <h4 className="text-xs font-semibold text-gray-700 mb-2">Month</h4>
          
//           <div className="relative">
//             <button
//               onClick={() => setShowMonthCalendar(!showMonthCalendar)}
//               className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
//             >
//               <span className="text-sm text-gray-800 font-medium">
//                 {selectedMonth}
//               </span>
//               <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMonthCalendar ? 'rotate-180' : ''}`} />
//             </button>

//             {showMonthCalendar && (
//               <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
//                 <div className="grid grid-cols-3 gap-1.5">
//                   {allMonths.map((month) => (
//                     <button
//                       key={month}
//                       onClick={() => handleMonthSelect(month)}
//                       className={`
//                         py-2 text-xs rounded transition-all
//                         ${selectedMonth === month
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
//                         }
//                       `}
//                     >
//                       {month.substring(0, 3)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="mb-4">
//           <h4 className="text-xs font-semibold text-gray-700 mb-2">Date</h4>
          
//           <div className="relative">
//             <button
//               onClick={() => setShowDateCalendar(!showDateCalendar)}
//               className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
//             >
//               <span className="text-sm text-gray-800 font-medium">
//                 {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Select date'}
//               </span>
//               <Calendar className="w-4 h-4 text-gray-500" />
//             </button>

//             {showDateCalendar && (
//               <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
//                 <div className="grid grid-cols-7 gap-0.5 mb-2">
//                   {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
//                     <div key={idx} className="text-xs font-medium text-gray-500 text-center py-1">
//                       {day}
//                     </div>
//                   ))}
                  
//                   {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
//                     <button
//                       key={day}
//                       onClick={() => {
//                         const newDate = new Date(
//                           selectedYear === 'all' ? new Date().getFullYear() : selectedYear, 
//                           allMonths.indexOf(selectedMonth), 
//                           day
//                         );
//                         handleDateSelect(newDate);
//                       }}
//                       className={`
//                         py-1 text-xs rounded transition-all
//                         ${selectedDate && 
//                           selectedDate.getDate() === day && 
//                           selectedDate.getMonth() === allMonths.indexOf(selectedMonth) &&
//                           selectedDate.getFullYear() === (selectedYear === 'all' ? new Date().getFullYear() : selectedYear)
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-white text-gray-700 hover:bg-blue-50'
//                         }
//                       `}
//                     >
//                       {day}
//                     </button>
//                   ))}
//                 </div>
                
//                 <button
//                   onClick={() => {
//                     const today = new Date();
//                     handleDateSelect(today);
//                     setSelectedMonth(allMonths[today.getMonth()]);
//                     setSelectedYear(today.getFullYear());
//                   }}
//                   className="w-full py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
//                 >
//                   Today
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="pt-3 border-t border-gray-100">
//           <h4 className="text-xs font-semibold text-gray-700 mb-2">Actions</h4>
//           <div className="space-y-2">
//             <button 
//               onClick={applyRentActivityFilters}
//               className="w-full px-1 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
//             >
//               Apply Filters
//             </button>
//             <button 
//               onClick={resetAllRentFilters}
//               className="w-full px-1 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
//             >
//               Reset All
//             </button>
//           </div>
//         </div>

//         <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
//           <p className="text-xs font-medium text-blue-800 mb-1">Active Filters</p>
//           <div className="space-y-1">
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Year:</span>
//               <span className="text-xs font-medium text-blue-700">
//                 {selectedYear === 'all' ? 'All Years' : selectedYear}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Month:</span>
//               <span className="text-xs font-medium text-blue-700">{selectedMonth}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Date:</span>
//               <span className="text-xs font-medium text-blue-700">
//                 {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Not selected'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Mode:</span>
//               <span className="text-xs font-medium text-blue-700">{comparisonMode}</span>
//             </div>
//             {comparisonMode === '2year' && (
//               <>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-600">Year 1:</span>
//                   <span className="text-xs font-medium text-blue-700">{selectedYear1 || 'Not selected'}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-600">Year 2:</span>
//                   <span className="text-xs font-medium text-blue-700">{selectedYear2 || 'Not selected'}</span>
//                 </div>
//               </>
//             )}
//             {comparisonMode === 'custom' && (
//               <>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-600">Month 1:</span>
//                   <span className="text-xs font-medium text-blue-700">{firstMonth ? `${firstMonth.substring(0, 3)} ${firstYear}` : 'Not selected'}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-600">Month 2:</span>
//                   <span className="text-xs font-medium text-blue-700">{secondMonth ? `${secondMonth.substring(0, 3)} ${secondYear}` : 'Not selected'}</span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </Card>
//       </div>
//     </div>
//   );
// }






// // import { Suspense } from 'react';
// // import DashboardClient from '@/components/admin/dashboard/DashboardClient';
// // import DashboardLoading from '@/components/admin/dashboard/loading';

// // export default async function AdminDashboardPage() {
// //   // For now, we'll remove initialData since fetchDashboardData is not implemented
// //   // const initialData = await fetchDashboardData();
  
// //   return (
// //     <div className="min-h-screen bg-blue-50 p-4">
// //       <Suspense fallback={<DashboardLoading />}>
// //         <DashboardClient initialData={undefined} />
// //       </Suspense>
// //     </div>
// //   );
// // }


"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Building2, DoorOpen, Users, CreditCard, TrendingUp, 
  MoreVertical, Filter, ChevronDown, Calendar, X, BarChart3, TrendingDown, DollarSign, ChevronLeft, ChevronRight, 
  FileText, Receipt
} from 'lucide-react';
import { LineChart } from 'recharts';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Line, BarChart, Bar
} from 'recharts';

// ─── Real API imports ────────────────────────────────────────────────────────
import { listProperties } from '@/lib/propertyApi';
import { listRooms } from '@/lib/roomsApi';
import { listTenants } from '@/lib/tenantApi';

// Types
type FinancialTab = 'all' | 'income' | 'expense' | 'profit';
type ChartType = 'area' | 'line' | 'bar';
type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom';
type ComparisonMode = '1year' | '2year' | 'custom' | null;

interface MonthlySummary {
  income: number;
  expense: number;
  netProfit: number;
}

// ─── FinancialTrendChart ──────────────────────────────────────────────────────
const FinancialTrendChart: React.FC<{
  summary: MonthlySummary;
  activeTab: FinancialTab;
  chartType: ChartType;
  selectedYear: number | 'all';
  selectedMonth: string;
  onTabChange: (tab: FinancialTab) => void;
  onChartTypeChange: (type: ChartType) => void;
  onYearChange: (year: number | 'all') => void;
  onClose: () => void;
}> = ({ summary, activeTab, chartType, selectedYear, selectedMonth, onTabChange, onChartTypeChange, onYearChange, onClose }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'1year' | '2year' | '2month'>('1year');
  const [selectedYear1, setSelectedYear1] = useState<string>('2024');
  const [selectedYear2, setSelectedYear2] = useState<string>('2023');
  const [firstMonth, setFirstMonth] = useState<string>('January');
  const [firstYear, setFirstYear] = useState<string>('2024');
  const [secondMonth, setSecondMonth] = useState<string>('June');
  const [secondYear, setSecondYear] = useState<string>('2024');
  const [filteredTrendData, setFilteredTrendData] = useState<any[]>([]);
  const [chartTitle, setChartTitle] = useState('Financial Trend Analysis');

  const allMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const availableYears = [2022, 2023, 2024, 2025, 2026];

  const getBaseTrendData = () => [
    { month: 'Jan', year: 2024, income: 382500, expense: 331500, profit: 51000 },
    { month: 'Feb', year: 2024, income: 420000, expense: 310000, profit: 110000 },
    { month: 'Mar', year: 2024, income: 480000, expense: 340000, profit: 140000 },
    { month: 'Apr', year: 2024, income: 450000, expense: 390000, profit: 60000 },
    { month: 'May', year: 2024, income: 520000, expense: 330000, profit: 190000 },
    { month: 'Jun', year: 2024, income: 580000, expense: 410000, profit: 170000 },
    { month: 'Jan', year: 2023, income: 325125, expense: 281775, profit: 43350 },
    { month: 'Feb', year: 2023, income: 357000, expense: 263500, profit: 93500 },
    { month: 'Mar', year: 2023, income: 408000, expense: 289000, profit: 119000 },
    { month: 'Apr', year: 2023, income: 382500, expense: 331500, profit: 51000 },
    { month: 'May', year: 2023, income: 442000, expense: 280500, profit: 161500 },
    { month: 'Jun', year: 2023, income: 493000, expense: 348500, profit: 144500 },
    { month: 'Jan', year: 2022, income: 267750, expense: 232050, profit: 35700 },
    { month: 'Feb', year: 2022, income: 294000, expense: 217000, profit: 77000 },
    { month: 'Mar', year: 2022, income: 336000, expense: 238000, profit: 98000 },
    { month: 'Apr', year: 2022, income: 315000, expense: 273000, profit: 42000 },
    { month: 'May', year: 2022, income: 364000, expense: 231000, profit: 133000 },
    { month: 'Jun', year: 2022, income: 406000, expense: 287000, profit: 119000 },
  ];

  const getComparisonLabel = useCallback(() => {
    switch (comparisonMode) {
      case '1year': return selectedYear === 'all' ? 'All Years' : `Year ${selectedYear}`;
      case '2year': return `Compare ${selectedYear1} vs ${selectedYear2}`;
      case '2month': return `${firstMonth.substring(0,3)} ${firstYear} vs ${secondMonth.substring(0,3)} ${secondYear}`;
      default: return 'All Years';
    }
  }, [comparisonMode, selectedYear, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear]);

  const getFilteredData = useCallback(() => {
    const base = getBaseTrendData();
    switch (comparisonMode) {
      case '1year': return selectedYear === 'all' ? base : base.filter(d => d.year === selectedYear);
      case '2year': {
        const y1 = parseInt(selectedYear1 || '2024');
        const y2 = parseInt(selectedYear2 || '2023');
        return base.filter(d => d.year === y1 || d.year === y2);
      }
      case '2month': {
        const m1 = firstMonth.substring(0, 3);
        const m2 = secondMonth.substring(0, 3);
        return base
          .filter(d => (d.month === m1 && d.year === parseInt(firstYear || '2024')) || (d.month === m2 && d.year === parseInt(secondYear || '2024')))
          .map(d => ({ ...d, month: d.month === m1 ? `${firstMonth.substring(0,3)} ${firstYear}` : `${secondMonth.substring(0,3)} ${secondYear}` }));
      }
      default: return base.filter(d => d.year === (selectedYear === 'all' ? 2024 : selectedYear));
    }
  }, [comparisonMode, selectedYear, selectedYear1, selectedYear2, firstMonth, firstYear, secondMonth, secondYear]);

  useEffect(() => {
    setFilteredTrendData(getFilteredData());
    setChartTitle(`Financial Trend Analysis - ${getComparisonLabel()}`);
  }, [getFilteredData, getComparisonLabel]);

  const chartData = useMemo(() => filteredTrendData.map(item => {
    const month = comparisonMode === '2month' ? item.month : `${item.month} ${item.year}`;
    if (activeTab === 'income') return { ...item, month, value: item.income, label: 'Income' };
    if (activeTab === 'expense') return { ...item, month, value: item.expense, label: 'Expense' };
    if (activeTab === 'profit') return { ...item, month, value: item.profit, label: 'Profit' };
    return { ...item, month };
  }), [filteredTrendData, activeTab, comparisonMode]);

  const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = chartData.reduce((s, d) => s + d.profit, 0);
  const avgIncome = Math.round(totalIncome / (chartData.length || 1));
  const avgExpense = Math.round(totalExpense / (chartData.length || 1));
  const avgProfit = Math.round(totalProfit / (chartData.length || 1));

  const chartColors = useMemo(() => {
    switch (activeTab) {
      case 'income': return { stroke: '#10b981', gradient: 'url(#colorIncome)', name: 'Income' };
      case 'expense': return { stroke: '#f43f5e', gradient: 'url(#colorExpense)', name: 'Expense' };
      case 'profit': return { stroke: '#3b82f6', gradient: 'url(#colorProfit)', name: 'Profit' };
      default: return null;
    }
  }, [activeTab]);

  const applyFilters = () => {
    const newData = getFilteredData();
    setFilteredTrendData(newData.length ? newData : getBaseTrendData().filter(d => d.year === 2024));
    setChartTitle(`Financial Trend Analysis - ${getComparisonLabel()}`);
    setShowFilterPanel(false);
    alert(`✅ Filters Applied!\nMode: ${comparisonMode === '1year' ? 'Single Year' : comparisonMode === '2year' ? 'Compare Years' : 'Compare Months'}\nData Points: ${newData.length}`);
  };

  const resetFilters = () => {
    setComparisonMode('1year'); setSelectedYear1('2024'); setSelectedYear2('2023');
    setFirstMonth('January'); setFirstYear('2024'); setSecondMonth('June'); setSecondYear('2024');
    setFilteredTrendData(getBaseTrendData().filter(d => d.year === 2024));
    setChartTitle('Financial Trend Analysis - Year 2024');
    onYearChange(2024);
    alert('✅ All filters reset to default');
  };

  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex relative">
        {/* Main */}
        <div className={`transition-all duration-300 ${showFilterPanel ? 'w-3/4' : 'w-full'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{chartTitle}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded mr-2">{comparisonMode === '1year' ? 'Single Year' : comparisonMode === '2year' ? 'Compare Years' : 'Compare Months'}</span>
                  <span className="text-green-600 font-bold">{filteredTrendData.length} data points</span>
                </p>
              </div>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="p-2 hover:bg-gray-100 rounded-lg transition-all relative">
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
          </div>

          {/* Stats */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Total Income', val: totalIncome, avg: avgIncome, icon: TrendingUp, color: 'green' },
                { label: 'Total Expense', val: totalExpense, avg: avgExpense, icon: TrendingDown, color: 'red' },
                { label: 'Net Profit', val: totalProfit, avg: avgProfit, icon: DollarSign, color: 'blue' },
              ].map(({ label, val, avg, icon: Icon, color }) => (
                <div key={label} className={`bg-white p-3 rounded-xl shadow-sm border border-${color}-100`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-lg bg-${color}-100 flex items-center justify-center`}><Icon className={`h-5 w-5 text-${color}-600`} /></div>
                    <div><p className="text-xs font-medium text-gray-600">{label}</p><p className={`text-lg font-bold text-${color}-600`}>₹{val.toLocaleString()}</p></div>
                  </div>
                  <div className={`mt-1 text-xs text-${color}-500`}>Avg: ₹{avg.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} dy={10} angle={chartData.length > 6 ? -45 : 0} textAnchor={chartData.length > 6 ? 'end' : 'middle'} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{fontSize:'11px',fontWeight:600}} labelStyle={{marginBottom:'6px',fontWeight:700,color:'#1e293b'}} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'20px',fontWeight:600,fontSize:'11px'}} />
                    {activeTab === 'all' ? (<>
                      <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" activeDot={{r:6,strokeWidth:0}} />
                      <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expense" activeDot={{r:6,strokeWidth:0}} />
                      <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Profit" activeDot={{r:6,strokeWidth:0}} />
                    </>) : (
                      <Area type="monotone" dataKey="value" stroke={chartColors?.stroke} strokeWidth={3} fillOpacity={1} fill={chartColors?.gradient} name={chartColors?.name} activeDot={{r:6,strokeWidth:0}} />
                    )}
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'20px',fontWeight:600,fontSize:'11px'}} />
                    {activeTab === 'all' ? (<>
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{r:4,strokeWidth:2,stroke:'#10b981',fill:'white'}} activeDot={{r:6,strokeWidth:0}} name="Income" />
                      <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={{r:4,strokeWidth:2,stroke:'#f43f5e',fill:'white'}} activeDot={{r:6,strokeWidth:0}} name="Expense" />
                      <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{r:4,strokeWidth:2,stroke:'#3b82f6',fill:'white'}} activeDot={{r:6,strokeWidth:0}} name="Profit" />
                    </>) : (
                      <Line type="monotone" dataKey="value" stroke={chartColors?.stroke} strokeWidth={3} dot={{r:4,strokeWidth:2,stroke:chartColors?.stroke,fill:'white'}} activeDot={{r:6,strokeWidth:0}} name={chartColors?.name} />
                    )}
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11,fontWeight:600}} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom:'20px',fontWeight:600,fontSize:'11px'}} />
                    {activeTab === 'all' ? (<>
                      <Bar dataKey="income" fill="#10b981" name="Income" radius={[6,6,0,0]} />
                      <Bar dataKey="expense" fill="#f43f5e" name="Expense" radius={[6,6,0,0]} />
                      <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[6,6,0,0]} />
                    </>) : (
                      <Bar dataKey="value" fill={chartColors?.stroke} name={chartColors?.name} radius={[6,6,0,0]} />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer controls */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 px-1.5">View:</span>
                  {(['all','income','expense','profit'] as FinancialTab[]).map(tab => (
                    <button key={tab} onClick={() => onTabChange(tab)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${activeTab===tab?'bg-blue-600 text-white':'hover:bg-gray-100 text-gray-700'}`}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 px-1.5">Chart:</span>
                  {(['area','line','bar'] as ChartType[]).map(type => (
                    <button key={type} onClick={() => onChartTypeChange(type)} className={`p-1.5 rounded transition-all ${chartType===type?'bg-blue-100 text-blue-600':'hover:bg-gray-100 text-gray-600'}`}>
                      {type==='area'&&<LineChart className="w-3.5 h-3.5"/>}
                      {type==='line'&&<TrendingUp className="w-3.5 h-3.5"/>}
                      {type==='bar'&&<BarChart3 className="w-3.5 h-3.5"/>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg border border-gray-200">
                  <select className="bg-transparent border-none outline-none text-xs font-medium text-gray-700" value={selectedYear} onChange={e => onYearChange(e.target.value==='all'?'all':parseInt(e.target.value))}>
                    <option value="all">All Years</option>
                    {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={() => alert('Export feature coming soon!')} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Export</button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className={`absolute right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${showFilterPanel?'w-1/4 translate-x-0':'w-0 translate-x-full'}`}>
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg"><Filter className="w-4 h-4 text-blue-600"/></div>
                <div><h3 className="font-semibold text-gray-800 text-sm">Filter Trends</h3><p className="text-xs text-gray-500">Compare financial data</p></div>
              </div>
              <button onClick={() => setShowFilterPanel(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-700">Comparison Type</h4>
              <div className="space-y-2">
                {/* Single Year */}
                <button onClick={() => setComparisonMode('1year')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='1year'?'bg-blue-50 text-blue-700 border border-blue-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span>Single Year</span></div>{comparisonMode==='1year'&&<Check className="w-3.5 h-3.5 text-blue-500"/>}</div>
                </button>
                {/* Compare Years */}
                <button onClick={() => setComparisonMode(comparisonMode==='2year'?'1year':'2year')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='2year'?'bg-green-50 text-green-700 border border-green-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex gap-0.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div></div><span>Compare Years</span></div><ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode==='2year'?'rotate-180':''}`}/></div>
                </button>
                {comparisonMode==='2year'&&(
                  <div className="p-3 bg-green-50/30 rounded-lg border border-green-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label><select value={selectedYear1} onChange={e => setSelectedYear1(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Choose year</option>{availableYears.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                      <div><label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label><select value={selectedYear2} onChange={e => setSelectedYear2(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Choose year</option>{availableYears.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                    </div>
                  </div>
                )}
                {/* Compare Months */}
                <button onClick={() => setComparisonMode(comparisonMode==='2month'?'1year':'2month')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='2month'?'bg-purple-50 text-purple-700 border border-purple-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span>Compare Months</span></div><ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode==='2month'?'rotate-180':''}`}/></div>
                </button>
                {comparisonMode==='2month'&&(
                  <div className="bg-purple-50/30 rounded-lg border border-purple-100 p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700"><div>Month 1</div><div>Month 2</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={firstMonth} onChange={e=>setFirstMonth(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">{allMonths.map(m=><option key={`f-${m}`} value={m}>{m.substring(0,3)}</option>)}</select>
                      <select value={secondMonth} onChange={e=>setSecondMonth(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">{allMonths.map(m=><option key={`s-${m}`} value={m}>{m.substring(0,3)}</option>)}</select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={firstYear} onChange={e=>setFirstYear(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">{availableYears.map(y=><option key={`fy-${y}`} value={y}>{y}</option>)}</select>
                      <select value={secondYear} onChange={e=>setSecondYear(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">{availableYears.map(y=><option key={`sy-${y}`} value={y}>{y}</option>)}</select>
                    </div>
                    {(firstMonth||secondMonth)&&(
                      <div className="p-2 bg-purple-100/30 rounded border border-purple-100 text-xs text-center">
                        <span className="font-medium text-purple-700">{firstMonth&&firstYear?`${firstMonth.substring(0,3)} ${firstYear}`:'___'}</span>
                        <span className="mx-2 text-gray-400">vs</span>
                        <span className="font-medium text-purple-700">{secondMonth&&secondYear?`${secondMonth.substring(0,3)} ${secondYear}`:'___'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Actions</h4>
                <button onClick={applyFilters} className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center justify-center gap-2"><Check className="w-4 h-4"/>Apply Filters</button>
                <button onClick={resetFilters} className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 flex items-center justify-center gap-2 border border-gray-300"><RefreshCw className="w-4 h-4"/>Reset All</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  // ── Stats from real API ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalProperties: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0,
    totalTenants: 0, activeTenants: 0, monthlyRevenue: 0,
  });
  const [tentStats, setTentStats] = useState({ active: 0, inactive: 0, total: 0 });
  const [roomStats, setRoomStats] = useState({ active: 0, inactive: 0, total: 0 });
  const [propertyStats, setPropertyStats] = useState({ active: 0, inactive: 0, total: 0 });

  // ── UI state (same as original) ──────────────────────────────────────────
  const [firstMonth, setFirstMonth] = useState('');
  const [firstYear, setFirstYear] = useState('');
  const [secondMonth, setSecondMonth] = useState('');
  const [secondYear, setSecondYear] = useState('');
  const [selectedYear1, setSelectedYear1] = useState<string>('');
  const [selectedYear2, setSelectedYear2] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [startDateDisplay, setStartDateDisplay] = useState('');
  const [endDateDisplay, setEndDateDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [occupancyDateFilter, setOccupancyDateFilter] = useState<DateFilterType>('today');
  const [occupancySelectedDate, setOccupancySelectedDate] = useState<Date>(new Date());
  const [showOccupancyCalendar, setShowOccupancyCalendar] = useState(false);
  const [showYearCalendar, setShowYearCalendar] = useState(false);
  const [yearRange, setYearRange] = useState(2020);
  const [showFinancialTrend, setShowFinancialTrend] = useState(false);
  const [financialTab, setFinancialTab] = useState<FinancialTab>('all');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [financialYear, setFinancialYear] = useState<number | 'all'>('all');
  const [financialMonth, setFinancialMonth] = useState('January');
  const [selectedType, setSelectedType] = useState('');
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('1year');
  const [showComparisonDropdown, setShowComparisonDropdown] = useState(false);
  const [customStartMonth, setCustomStartMonth] = useState('January');
  const [customEndMonth, setCustomEndMonth] = useState('December');
  const [customYear, setCustomYear] = useState(new Date().getFullYear());

  const allAvailableYears = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002,2001,2000];
  const allMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const financialSummary: MonthlySummary = {
    income: stats.monthlyRevenue,
    expense: Math.round(stats.monthlyRevenue * 0.6),
    netProfit: Math.round(stats.monthlyRevenue * 0.4),
  };

  // ── Derived from real data ────────────────────────────────────────────────
  const tentOccupancyPercent = tentStats.total > 0 ? Math.round((tentStats.active / tentStats.total) * 100) : 0;
  const roomOccupancyPercent = roomStats.total > 0 ? Math.round((roomStats.active / roomStats.total) * 100) : 0;
  const propertyOccupancyPercent = propertyStats.total > 0 ? Math.round((propertyStats.active / propertyStats.total) * 100) : 0;
  const occupancyPercent = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  const expenseStats = {
    total: Math.round(stats.monthlyRevenue * 0.6),
    fixed: Math.round(stats.monthlyRevenue * 0.3),
    variable: Math.round(stats.monthlyRevenue * 0.3),
    ratio: 70,
  };
  const incomeStats = {
    total: stats.monthlyRevenue,
    rental: Math.round(stats.monthlyRevenue * 0.85),
    other: Math.round(stats.monthlyRevenue * 0.15),
    ratio: 85,
  };

  const rentActivityData = [
    { month: 'Jan', amount: 45000000 }, { month: 'Feb', amount: 52000000 },
    { month: 'Mar', amount: 48000000 }, { month: 'Apr', amount: 61000000 },
    { month: 'May', amount: 55000000 }, { month: 'Jun', amount: 68000000 },
  ];

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    setAnimatedHeights([]);
    const timers = rentActivityData.map((_, i) =>
      setTimeout(() => setAnimatedHeights(prev => prev.includes(i) ? prev : [...prev, i]), i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Load all real data ────────────────────────────────────────────────────
  const loadStats = async () => {
    setLoading(true);
    try {
      const [propertiesRes, roomsRes, tenantsRes, paymentsRes] = await Promise.allSettled([
        listProperties({ pageSize: 1000 }),
        listRooms(),
        listTenants({ pageSize: 1000 }),
        fetch('/api/payments?status=completed'),
      ]);

      // Properties
      let propertiesData: any[] = [];
      if (propertiesRes.status === 'fulfilled' && propertiesRes.value?.success) {
        propertiesData = propertiesRes.value.data?.data || propertiesRes.value.data || [];
      }
      const totalProperties = propertiesData.length;
      const activeProperties = propertiesData.filter((p: any) => p.is_active === true).length;
      const totalBeds = propertiesData.reduce((s: number, p: any) => s + (Number(p.total_beds) || 0), 0);
      const occupiedBeds = propertiesData.reduce((s: number, p: any) => s + (Number(p.occupied_beds) || 0), 0);
      setPropertyStats({ active: activeProperties, inactive: totalProperties - activeProperties, total: totalProperties });

      // Rooms
      let roomsData: any[] = [];
      if (roomsRes.status === 'fulfilled') {
        const v = roomsRes.value;
        roomsData = Array.isArray(v) ? v : (v?.data || []);
      }
      const totalRooms = roomsData.length;
      const activeRooms = roomsData.filter((r: any) => r.is_active === true).length;
      const totalBedsFromRooms = roomsData.reduce((s: number, r: any) => s + (Number(r.total_bed) || Number(r.total_beds) || 0), 0);
      const occupiedBedsFromRooms = roomsData.reduce((s: number, r: any) => s + (Number(r.occupied_beds) || 0), 0);
      setRoomStats({ active: activeRooms, inactive: totalRooms - activeRooms, total: totalRooms });

      // Tents = rooms with sharing_type 'tent'
      const tentRooms = roomsData.filter((r: any) => r.sharing_type?.toLowerCase() === 'tent');
      const activeTents = tentRooms.filter((r: any) => r.is_active === true).length;
      setTentStats({ active: activeTents, inactive: tentRooms.length - activeTents, total: tentRooms.length });

      // Tenants
      let tenantsData: any[] = [];
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.success) {
        tenantsData = tenantsRes.value.data || [];
      }
      const totalTenants = tenantsData.length;
      const activeTenants = tenantsData.filter((t: any) => t.is_active === true || t.status === 'active').length;

      // Payments
      let monthlyRevenue = 0;
      if (paymentsRes.status === 'fulfilled') {
        const payments = await (paymentsRes.value as Response).json().catch(() => []);
        if (Array.isArray(payments)) {
          const now = new Date();
          monthlyRevenue = payments
            .filter((p: any) => {
              const d = p.payment_date ? new Date(p.payment_date) : null;
              return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
        }
      }

      setStats({
        totalProperties,
        totalRooms,
        totalBeds: totalBedsFromRooms || totalBeds,
        occupiedBeds: occupiedBedsFromRooms || occupiedBeds,
        totalTenants,
        activeTenants,
        monthlyRevenue,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Stat cards use real data ──────────────────────────────────────────────
  const statCards = [
    { title: 'Total Properties', value: loading ? '...' : stats.totalProperties, icon: Building2 },
    { title: 'Total Rooms', value: loading ? '...' : stats.totalRooms, icon: DoorOpen },
    { title: 'Bed Occupancy', value: loading ? '...' : `${stats.occupiedBeds}/${stats.totalBeds}`, icon: Users },
    { title: 'Active Tenants', value: loading ? '...' : stats.activeTenants, icon: Users },
    { title: 'Monthly Revenue', value: loading ? '...' : `₹${stats.monthlyRevenue.toLocaleString()}`, icon: CreditCard },
  ];

  const applyRentActivityFilters = () => { setShowFilterPanel(false); setShowComparisonDropdown(false); };
  const resetAllRentFilters = () => {
    setSelectedMonth('January'); setSelectedYear('all'); setSelectedDate(null);
    setComparisonMode('1year'); setSelectedYear1(''); setSelectedYear2('');
    setFirstMonth(''); setFirstYear(''); setSecondMonth(''); setSecondYear('');
    setCustomStartMonth('January'); setCustomEndMonth('December'); setCustomYear(new Date().getFullYear());
  };
  const handleYearSelect = (year: number) => { setSelectedYear(year); setShowYearCalendar(false); setTimeout(applyRentActivityFilters, 100); };
  const handleMonthSelect = (month: string) => { setSelectedMonth(month); setShowMonthCalendar(false); setTimeout(applyRentActivityFilters, 100); };
  const handleDateSelect = (date: Date) => { setSelectedDate(date); setShowDateCalendar(false); setTimeout(applyRentActivityFilters, 100); };
  const handleOccupancyFilterChange = (filter: DateFilterType) => { setOccupancyDateFilter(filter); };
  const openFinancialTrend = () => { setFinancialYear(selectedYear); setFinancialMonth(selectedMonth); setShowFinancialTrend(true); setShowComparisonDropdown(false); };

  const getComparisonData = useMemo(() => () => {
    const cur = [
      { month: 'Jan', amount: 45000000 }, { month: 'Feb', amount: 52000000 }, { month: 'Mar', amount: 48000000 },
      { month: 'Apr', amount: 61000000 }, { month: 'May', amount: 55000000 }, { month: 'Jun', amount: 68000000 },
    ];
    const prev = [
      { month: 'Jan', amount: 38000000 }, { month: 'Feb', amount: 42000000 }, { month: 'Mar', amount: 45000000 },
      { month: 'Apr', amount: 52000000 }, { month: 'May', amount: 48000000 }, { month: 'Jun', amount: 60000000 },
    ];
    if (comparisonMode === '2year') return { labels: cur.map(d=>d.month), datasets: [{ data: cur, label: `${typeof selectedYear==='number'?selectedYear:new Date().getFullYear()}`, color: 'from-blue-600 to-blue-400' }, { data: prev, label: `${(typeof selectedYear==='number'?selectedYear:new Date().getFullYear())-1}`, color: 'from-green-600 to-green-400' }], isComparison: true };
    if (comparisonMode === 'custom') return { labels: [customStartMonth.substring(0,3), customEndMonth.substring(0,3)], datasets: [{ data: [{ month: customStartMonth.substring(0,3), amount: 35000000 }, { month: customEndMonth.substring(0,3), amount: 62000000 }], label: `${customYear}`, color: 'from-purple-600 to-purple-400' }], isComparison: false };
    return { labels: cur.map(d=>d.month), datasets: [{ data: cur, label: selectedYear==='all'?'All Years':`${selectedYear}`, color: 'from-blue-600 to-blue-400' }], isComparison: false };
  }, [comparisonMode, selectedYear, customStartMonth, customEndMonth, customYear]);

  const comparisonData = getComparisonData();
  const maxAmount = Math.max(...comparisonData.datasets.flatMap(ds => ds.data.map(d => d.amount)), 1);

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      {showFinancialTrend && (
        <FinancialTrendChart
          summary={financialSummary} activeTab={financialTab} chartType={chartType}
          selectedYear={financialYear} selectedMonth={financialMonth}
          onTabChange={setFinancialTab} onChartTypeChange={setChartType}
          onYearChange={setFinancialYear} onClose={() => setShowFinancialTrend(false)}
        />
      )}

      {/* Occupancy Calendar Modal */}
      {showOccupancyCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
              <button onClick={() => setShowOccupancyCalendar(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600"/></button>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { const d=new Date(occupancySelectedDate); d.setMonth(d.getMonth()-1); setOccupancySelectedDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-600"/></button>
                <div className="text-lg font-bold text-gray-800">{occupancySelectedDate.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
                <button onClick={() => { const d=new Date(occupancySelectedDate); d.setMonth(d.getMonth()+1); setOccupancySelectedDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-600"/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length:35}).map((_,i) => {
                  const day = i - new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth(), 1).getDay() + 1;
                  const date = new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth(), day);
                  const daysInMonth = new Date(occupancySelectedDate.getFullYear(), occupancySelectedDate.getMonth()+1, 0).getDate();
                  const isToday = date.toDateString()===new Date().toDateString();
                  const isSelected = date.toDateString()===occupancySelectedDate.toDateString();
                  return day>0&&day<=daysInMonth ? (
                    <button key={i} onClick={() => { setOccupancySelectedDate(date); handleOccupancyFilterChange('custom'); setShowOccupancyCalendar(false); }} className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isSelected?'bg-blue-600 text-white':isToday?'bg-blue-100 text-blue-600':'hover:bg-gray-100 text-gray-700'}`}>{day}</button>
                  ) : <div key={i} className="h-10"/>;
                })}
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setOccupancySelectedDate(new Date()); handleOccupancyFilterChange('custom'); setShowOccupancyCalendar(false); }} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">Today</button>
                <button onClick={() => { const t=new Date(); t.setDate(t.getDate()+1); setOccupancySelectedDate(t); handleOccupancyFilterChange('custom'); setShowOccupancyCalendar(false); }} className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100">Tomorrow</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-800 flex items-center justify-center shadow-md mb-4"><Icon className="h-6 w-6 text-white"/></div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ── Occupancy Overview ── */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-700">
                {selectedType==='tents'?'Tents Overview':selectedType==='rooms'?'Rooms Overview':selectedType==='property'?'Property Overview':selectedType==='expenses'?'Expenses Overview':selectedType==='income'?'Income Overview':'Occupancy Overview'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Date filter */}
                <div className="relative">
                  <button onClick={() => { setShowFilter(!showFilter); if(showTypeMenu) setShowTypeMenu(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm">
                    <Calendar className="w-4 h-4 text-blue-600"/>
                    <span className="whitespace-nowrap">{selectedMonth.substring(0,3)} , {selectedYear==='all'?'All Years':selectedYear}</span>
                    <ChevronDown className={`w-3 h-3 text-blue-700 transition-transform duration-200 ${showFilter?'rotate-180':''}`}/>
                  </button>
                  {showFilter && (
                    <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
                      <div className="p-2 border-b border-gray-100"><h4 className="text-xs font-semibold text-gray-800">Filter Dates</h4></div>
                      <div className="p-2 space-y-3">
                        <div className="flex items-end gap-2">
                          <div className="flex-1"><label className="text-xs font-medium text-gray-700 mb-1 block">Start Date</label><input type="text" placeholder="DD/MM/YYYY" value={startDateDisplay} onFocus={() => setIsSelectingStartDate(true)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" size={10}/></div>
                          <div className="pb-1"><span className="text-gray-400">→</span></div>
                          <div className="flex-1"><label className="text-xs font-medium text-gray-700 mb-1 block">End Date</label><input type="text" placeholder="DD/MM/YYYY" value={endDateDisplay} onFocus={() => setIsSelectingEndDate(true)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500" size={10}/></div>
                        </div>
                        <div className="flex gap-2">
                          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">{allMonths.map(m=><option key={m} value={m}>{m.substring(0,3)}</option>)}</select>
                          <div className="flex-1 relative">
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value==='all'?'all':parseInt(e.target.value))} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none">
                              <option value="all">All Years</option>
                              {Array.from({length:10},(_,i)=>new Date().getFullYear()-i).map(y=><option key={y} value={y}>{y}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1"><ChevronDown className="w-3 h-3"/></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { if(startDate&&endDate){ handleOccupancyFilterChange('custom'); setShowFilter(false); } }} disabled={!startDate||!endDate} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Apply</button>
                          <button onClick={() => { setSelectedMonth('January'); setSelectedYear('all'); setStartDate(''); setEndDate(''); setStartDateDisplay(''); setEndDateDisplay(''); }} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">Reset</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Type selector */}
                <div className="flex items-center gap-2">
                  {selectedType && (
                    <button onClick={() => setSelectedType('')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 rounded-lg text-white transition-colors shadow-sm text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => { setShowTypeMenu(!showTypeMenu); if(showFilter) setShowFilter(false); }} className="flex items-center justify-center w-8 h-8 bg-blue-700 border border-gray-300 rounded-lg text-white hover:bg-blue-500 transition-colors shadow-sm">
                      <MoreVertical className="w-5 h-4"/>
                    </button>
                    {showTypeMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-2.5">
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { key:'tents', label:'Tents', bg:'bg-blue-100', icon:<svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>, hover:'hover:bg-blue-50' },
                              { key:'rooms', label:'Rooms', bg:'bg-emerald-100', icon:<svg className="w-3.5 h-3.5 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, hover:'hover:bg-emerald-50' },
                              { key:'property', label:'Property', bg:'bg-violet-100', icon:<svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>, hover:'hover:bg-violet-50' },
                              { key:'expenses', label:'Expenses', bg:'bg-amber-100', icon:<svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>, hover:'hover:bg-amber-50' },
                              { key:'income', label:'Income', bg:'bg-green-100', icon:<svg className="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, hover:'hover:bg-green-50' },
                            ].map(({ key, label, bg, icon, hover }) => (
                              <button key={key} onClick={() => { setSelectedType(key); setShowTypeMenu(false); }} className={`w-full p-1.5 text-gray-800 ${hover} rounded-lg transition-all duration-150 flex flex-col items-center gap-1 group`}>
                                <div className={`w-7 h-7 flex items-center justify-center ${bg} rounded-full group-hover:scale-110 transition-transform duration-200`}>{icon}</div>
                                <span className="text-[10px] font-semibold text-gray-800">{label}</span>
                              </button>
                            ))}
                            <div className="w-full p-1.5 opacity-0 cursor-default"><div className="w-7 h-7"/><span className="text-[10px]">&nbsp;</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col items-center">
              {/* Donut chart */}
              <div className="relative w-40 h-40 mb-6">
                {(() => {
                  const configs: Record<string, { bg: string; fill: string; pct: number; label: string }> = {
                    tents:    { bg:'bg-green-300',  fill:'#10B981', pct:tentOccupancyPercent,    label:'Occupied Tents' },
                    rooms:    { bg:'bg-purple-300', fill:'#8B5CF6', pct:roomOccupancyPercent,    label:'Occupied Rooms' },
                    property: { bg:'bg-red-300',    fill:'#EF4444', pct:propertyOccupancyPercent,label:'Occupied Property' },
                    expenses: { bg:'bg-orange-300', fill:'#EF4444', pct:expenseStats.ratio,       label:'Expenses Ratio' },
                    income:   { bg:'bg-green-300',  fill:'#10B981', pct:incomeStats.ratio,        label:'Income Ratio' },
                  };
                  const cfg = selectedType && configs[selectedType] ? configs[selectedType] : { bg:'bg-yellow-300', fill:'#3B82F6', pct:occupancyPercent, label:'Occupied' };
                  return (<>
                    <div className={`absolute inset-0 rounded-full ${cfg.bg}`}></div>
                    <div className="absolute inset-0 rounded-full"><div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(${cfg.fill} ${cfg.pct*3.6}deg, transparent 0deg)`}}/></div>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-slate-800">{cfg.pct}%</span>
                      <span className="text-sm text-gray-500 mt-1 text-center px-1">{cfg.label}</span>
                    </div>
                  </>);
                })()}
              </div>

              {/* Stats list — real data */}
              {selectedType === 'tents' ? (
                <div className="w-full space-y-4">
                  {[{label:'Active Tents',sub:'Currently occupied',val:tentStats.active,bg:'bg-green-50',dot:'bg-green-500',text:'text-green-600'},{label:'Inactive Tents',sub:'Vacant or closed',val:tentStats.inactive,bg:'bg-red-50',dot:'bg-red-500',text:'text-red-600'},{label:'Total Tents',sub:'',val:tentStats.total,bg:'bg-gray-50',dot:'',text:'text-gray-800'}].map(({ label, sub, val, bg, dot, text }) => (
                    <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">{dot?<div className={`w-4 h-4 rounded-full ${dot}`}/>:<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}</div>
                        <div><p className="text-sm font-medium text-gray-700">{label}</p>{sub&&<p className="text-xs text-gray-500">{sub}</p>}</div>
                      </div>
                      <p className={`text-xl font-bold ${text}`}>{val}</p>
                    </div>
                  ))}
                </div>
              ) : selectedType === 'rooms' ? (
                <div className="w-full space-y-4">
                  {[{label:'Active Rooms',sub:'Currently occupied',val:roomStats.active,bg:'bg-purple-50',dot:'bg-purple-500',text:'text-purple-600'},{label:'Inactive Rooms',sub:'Vacant or closed',val:roomStats.inactive,bg:'bg-orange-50',dot:'bg-orange-500',text:'text-orange-600'},{label:'Total Rooms',sub:'',val:roomStats.total,bg:'bg-gray-50',dot:'',text:'text-gray-800'}].map(({ label, sub, val, bg, dot, text }) => (
                    <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">{dot?<div className={`w-4 h-4 rounded-full ${dot}`}/>:<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}</div>
                        <div><p className="text-sm font-medium text-gray-700">{label}</p>{sub&&<p className="text-xs text-gray-500">{sub}</p>}</div>
                      </div>
                      <p className={`text-xl font-bold ${text}`}>{val}</p>
                    </div>
                  ))}
                </div>
              ) : selectedType === 'property' ? (
                <div className="w-full space-y-4">
                  {[{label:'Active Properties',sub:'Currently occupied',val:propertyStats.active,bg:'bg-red-50',dot:'bg-red-500',text:'text-red-600'},{label:'Inactive Properties',sub:'Vacant or closed',val:propertyStats.inactive,bg:'bg-blue-50',dot:'bg-blue-500',text:'text-blue-600'},{label:'Total Properties',sub:'',val:propertyStats.total,bg:'bg-gray-50',dot:'',text:'text-gray-800'}].map(({ label, sub, val, bg, dot, text }) => (
                    <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">{dot?<div className={`w-4 h-4 rounded-full ${dot}`}/>:<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}</div>
                        <div><p className="text-sm font-medium text-gray-700">{label}</p>{sub&&<p className="text-xs text-gray-500">{sub}</p>}</div>
                      </div>
                      <p className={`text-xl font-bold ${text}`}>{val}</p>
                    </div>
                  ))}
                </div>
              ) : selectedType === 'expenses' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-red-600"/></div><div><p className="text-sm font-medium text-gray-700">Monthly Expenses</p><p className="text-xs text-gray-500">Total spent this month</p></div></div><p className="text-xl font-bold text-red-600">₹{expenseStats.total.toLocaleString()}</p></div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><FileText className="w-4 h-4 text-orange-600"/></div><div><p className="text-sm font-medium text-gray-700">Fixed Costs</p><p className="text-xs text-gray-500">Rent, utilities, etc.</p></div></div><p className="text-xl font-bold text-orange-600">₹{expenseStats.fixed.toLocaleString()}</p></div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Receipt className="w-4 h-4 text-gray-600"/></div><div><p className="text-sm font-medium text-gray-700">Variable Costs</p></div></div><p className="text-xl font-bold text-gray-800">₹{expenseStats.variable.toLocaleString()}</p></div>
                </div>
              ) : selectedType === 'income' ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600"/></div><div><p className="text-sm font-medium text-gray-700">Monthly Income</p><p className="text-xs text-gray-500">Total earned this month</p></div></div><p className="text-xl font-bold text-green-600">₹{incomeStats.total.toLocaleString()}</p></div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600"/></div><div><p className="text-sm font-medium text-gray-700">Rental Income</p><p className="text-xs text-gray-500">From tenants</p></div></div><p className="text-xl font-bold text-blue-600">₹{incomeStats.rental.toLocaleString()}</p></div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><DollarSign className="w-4 h-4 text-purple-600"/></div><div><p className="text-sm font-medium text-gray-700">Other Income</p><p className="text-xs text-gray-500">Services, fees, etc.</p></div></div><p className="text-xl font-bold text-purple-600">₹{incomeStats.other.toLocaleString()}</p></div>
                </div>
              ) : (
                // Default: Beds — real data
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-blue-500"/></div><div><p className="text-sm font-medium text-gray-700">Occupied Beds</p><p className="text-xs text-gray-500">Currently in use</p></div></div><p className="text-xl font-bold text-blue-600">{stats.occupiedBeds}</p></div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-yellow-500"/></div><div><p className="text-sm font-medium text-gray-700">Available Beds</p><p className="text-xs text-gray-500">Ready for occupancy</p></div></div><p className="text-xl font-bold text-yellow-600">{Math.max(0,stats.totalBeds-stats.occupiedBeds)}</p></div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-4 h-4 text-gray-600"/></div><div><p className="text-sm font-medium text-gray-700">Total Beds</p></div></div><p className="text-xl font-bold text-gray-800">{stats.totalBeds}</p></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Rent Activity Over Time ── */}
        <Card className="border-0 shadow-lg lg:col-span-2 relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowComparisonDropdown(!showComparisonDropdown)} className="p-2 hover:bg-blue-50 rounded-lg"><MoreVertical className="w-5 h-5 text-blue-600"/></button>
                  {showComparisonDropdown && (
                    <div className="absolute left-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center justify-between">
                          <div><h3 className="font-bold text-gray-800 text-sm">Compare Data</h3><p className="text-xs text-gray-500 mt-0.5">Select comparison type</p></div>
                          <button onClick={() => setShowComparisonDropdown(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500"/></button>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={openFinancialTrend} className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 rounded-lg text-xs font-medium border border-blue-200 flex items-center justify-center gap-1.5"><LineChart className="w-3.5 h-3.5"/><span>Trends</span></button>
                          <button onClick={() => { setSelectedYear1(''); setSelectedYear2(''); setFirstMonth(''); setFirstYear(''); setSecondMonth(''); setSecondYear(''); setComparisonMode('1year'); setShowComparisonDropdown(false); }} className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300 flex items-center justify-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/><span>Reset</span></button>
                        </div>
                      </div>
                      <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <button onClick={() => { setComparisonMode('1year'); setShowComparisonDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='1year'?'bg-blue-50 text-blue-700 border border-blue-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/><span>Single Year</span></div>{comparisonMode==='1year'&&<Check className="w-3.5 h-3.5 text-blue-500"/>}</div>
                        </button>
                        {/* Compare Years */}
                        <div className="space-y-2">
                          <button onClick={() => setComparisonMode(comparisonMode==='2year'?null:'2year')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='2year'?'bg-green-50 text-green-700 border border-green-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex gap-0.5"><div className="w-2 h-2 rounded-full bg-blue-500"/><div className="w-2 h-2 rounded-full bg-green-500"/></div><span>Compare Years</span></div><ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode==='2year'?'rotate-180':''}`}/></div>
                          </button>
                          {comparisonMode==='2year'&&(
                            <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-medium text-gray-700 mb-1 block">Year 1</label><select value={selectedYear1||''} onChange={e=>{setSelectedYear1(e.target.value);if(e.target.value&&selectedYear2) setTimeout(applyRentActivityFilters,100);}} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"><option value="">Choose year</option>{allAvailableYears.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                                <div><label className="text-xs font-medium text-gray-700 mb-1 block">Year 2</label><select value={selectedYear2||''} onChange={e=>{setSelectedYear2(e.target.value);if(e.target.value&&selectedYear1) setTimeout(applyRentActivityFilters,100);}} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white appearance-none"><option value="">Choose year</option>{allAvailableYears.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                              </div>
                              <button onClick={() => {if(selectedYear1&&selectedYear2) applyRentActivityFilters();}} disabled={!selectedYear1||!selectedYear2} className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Apply Filter</button>
                            </div>
                          )}
                        </div>
                        {/* Compare Months */}
                        <div className="space-y-2">
                          <button onClick={() => setComparisonMode(comparisonMode==='custom'?null:'custom')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${comparisonMode==='custom'?'bg-purple-50 text-purple-700 border border-purple-200':'hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"/><span>Compare Months</span></div><ChevronDown className={`w-3.5 h-3.5 transition-transform ${comparisonMode==='custom'?'rotate-180':''}`}/></div>
                          </button>
                          {comparisonMode==='custom'&&(
                            <div className="bg-purple-50/30 rounded-lg border border-purple-100 p-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700"><div>Month 1</div><div>Month 2</div></div>
                              <div className="grid grid-cols-2 gap-2">
                                <select value={firstMonth||''} onChange={e=>setFirstMonth(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Select Month</option>{allMonths.map(m=><option key={`f-${m}`} value={m}>{m.substring(0,3)}</option>)}</select>
                                <select value={secondMonth||''} onChange={e=>setSecondMonth(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Select Month</option>{allMonths.map(m=><option key={`s-${m}`} value={m}>{m.substring(0,3)}</option>)}</select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <select value={firstYear||''} onChange={e=>setFirstYear(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Year</option>{allAvailableYears.map(y=><option key={`fy-${y}`} value={y}>{y}</option>)}</select>
                                <select value={secondYear||''} onChange={e=>setSecondYear(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white"><option value="">Year</option>{allAvailableYears.map(y=><option key={`sy-${y}`} value={y}>{y}</option>)}</select>
                              </div>
                              {(firstMonth||secondMonth)&&(
                                <div className="p-2 bg-purple-100/30 rounded border border-purple-100 text-xs text-center">
                                  <span className="font-medium text-purple-700">{firstMonth&&firstYear?`${firstMonth.substring(0,3)} ${firstYear}`:'___'}</span>
                                  <span className="mx-2 text-gray-400">vs</span>
                                  <span className="font-medium text-purple-700">{secondMonth&&secondYear?`${secondMonth.substring(0,3)} ${secondYear}`:'___'}</span>
                                </div>
                              )}
                              <div className="flex gap-2 pt-2">
                                <button onClick={() => {setFirstMonth('');setFirstYear('');setSecondMonth('');setSecondYear('');}} className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium">Clear</button>
                                <button onClick={() => {const t=new Date();const cm=allMonths[t.getMonth()];const cy=t.getFullYear().toString();setFirstMonth(cm);setFirstYear(cy);const pm=t.getMonth()===0?11:t.getMonth()-1;const pmy=t.getMonth()===0?t.getFullYear()-1:t.getFullYear();setSecondMonth(allMonths[pm]);setSecondYear(pmy.toString());setTimeout(applyRentActivityFilters,100);}} className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium">Recent</button>
                                <button onClick={() => {if(firstMonth&&firstYear&&secondMonth&&secondYear) applyRentActivityFilters();}} disabled={!firstMonth||!firstYear||!secondMonth||!secondYear} className="flex-1 px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">Apply</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Rent Activity Over Time</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Showing:</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {comparisonMode==='1year'&&(selectedYear==='all'?'All Years':`${selectedYear}`)}
                      {comparisonMode==='2year'&&`${selectedYear1||'Year 1'} vs ${selectedYear2||'Year 2'}`}
                      {comparisonMode==='custom'&&`${firstMonth?firstMonth.substring(0,3):'___'} ${firstYear||''} vs ${secondMonth?secondMonth.substring(0,3):'___'} ${secondYear||''}`}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors relative">
                <Filter className="w-5 h-5 text-blue-600"/>
                {showFilterPanel&&<div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-500 rounded-full"/>}
              </button>
            </div>
          </CardHeader>

          <div className="flex relative">
            <div className={`transition-all duration-300 ${showFilterPanel?'w-3/4 pr-4':'w-full'}`}>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Amount (₹)</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full"><TrendingUp className="w-4 h-4 text-green-600"/><span className="text-sm font-medium text-green-600">+12.5%</span></div>
                  </div>
                  {comparisonMode==='2year'&&(
                    <div className="flex items-center gap-4">
                      {comparisonData.datasets.map((ds,idx) => (
                        <div key={idx} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${idx===0?'bg-blue-500':'bg-green-500'}`}/><span className="text-xs font-medium text-gray-700">{ds.label}</span></div>
                      ))}
                    </div>
                  )}
                  <div className="relative h-52">
                    <div className="absolute inset-0 flex flex-col justify-between">{[0,1,2,3,4].map(i=><div key={i} className="border-t border-gray-200"/>)}</div>
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                      <span className="font-medium">₹{maxAmount.toLocaleString()}</span>
                      <span>₹{Math.round(maxAmount*0.75).toLocaleString()}</span>
                      <span>₹{Math.round(maxAmount*0.5).toLocaleString()}</span>
                      <span>₹{Math.round(maxAmount*0.25).toLocaleString()}</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="absolute bottom-0 left-10 right-2 h-44 flex items-end justify-between">
                      {comparisonData.labels.map((label,index) => {
                        if (comparisonMode==='2year') {
                          const ds1 = comparisonData.datasets[0]; const ds2 = comparisonData.datasets[1];
                          const h1 = (ds1.data[index].amount/maxAmount)*85;
                          const h2 = (ds2.data[index].amount/maxAmount)*85;
                          const isAnim = animatedHeights.includes(index);
                          return (
                            <div key={index} className="flex flex-col items-center flex-1 mx-1">
                              <div className="relative h-44 w-full flex items-end justify-center">
                                <div className="flex items-end justify-center w-full gap-1">
                                  <div className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" style={{height:isAnim?`${h1}%`:'0%',minHeight:isAnim?'20px':'0px',transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                                  <div className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height:isAnim?`${h2}%`:'0%',minHeight:isAnim?'20px':'0px',transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700 mt-2">{label}</span>
                            </div>
                          );
                        }
                        const ds = comparisonData.datasets[0];
                        const h = (ds.data[index].amount/maxAmount)*85;
                        const isAnim = animatedHeights.includes(index);
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 mx-1">
                            <div className="relative h-44 w-full flex items-end justify-center">
                              <div className={`w-14 bg-gradient-to-t ${ds.color} rounded-t-lg relative group hover:opacity-90 hover:shadow-lg`} style={{height:isAnim?`${h}%`:'0%',minHeight:isAnim?'20px':'0px',transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}>
                                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                  <div className="font-semibold">₹{ds.data[index].amount.toLocaleString()}</div>
                                  <div className="text-gray-300 text-xs">{ds.data[index].month}</div>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 mt-2">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium text-gray-700">Months</span>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-sm text-gray-600">{comparisonMode==='1year'?(selectedYear==='all'?'All Years':'Current Year'):comparisonMode==='2year'?'Current Year':'Custom Range'}</p>
                        <p className="text-lg font-bold text-gray-800">₹{comparisonData.datasets[0]?.data[comparisonData.datasets[0].data.length-1]?.amount?.toLocaleString()||'0'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Average</p>
                        <p className="text-lg font-bold text-gray-800">
                          {comparisonData.datasets.map((ds,idx) => {
                            const avg = ds.data.length>0?Math.round(ds.data.reduce((s,d)=>s+d.amount,0)/ds.data.length):0;
                            return <div key={idx} className={idx>0?'mt-1':''}>₹{avg.toLocaleString()}{comparisonData.datasets.length>1&&` (${ds.label})`}</div>;
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Filter panel */}
            <div className={`absolute right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${showFilterPanel?'w-1/4 translate-x-0':'w-0 translate-x-full'}`}>
              <div className="h-full overflow-y-auto p-4">
                <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="p-2 bg-blue-100 rounded-lg"><Filter className="w-4 h-4 text-blue-600"/></div><div><h3 className="font-semibold text-gray-800 text-sm">Filter Analytics</h3><p className="text-xs text-gray-500">Customize your view</p></div></div>
                </div>
                {/* Year picker */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Year</h4>
                  <div className="relative">
                    <button onClick={() => setShowYearCalendar(!showYearCalendar)} className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                      <span className={selectedYear==='all'?'text-xs text-gray-600':'text-sm text-gray-800 font-medium'}>{selectedYear==='all'?'All Years':selectedYear}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showYearCalendar?'rotate-180':''}`}/>
                    </button>
                    {showYearCalendar&&(
                      <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <button onClick={() => setYearRange(p=>p-6)} className="p-1.5 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
                          <span className="text-sm font-medium text-gray-700">{yearRange} - {yearRange+5}</span>
                          <button onClick={() => setYearRange(p=>p+6)} className="p-1.5 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {Array.from({length:6},(_,i)=>yearRange+i).map(y=>(
                            <button key={y} onClick={() => handleYearSelect(y)} className={`py-2 text-xs rounded transition-all ${selectedYear===y?'bg-blue-600 text-white':'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>{y}</button>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <button onClick={() => { setSelectedYear('all'); setShowYearCalendar(false); setTimeout(applyRentActivityFilters,100); }} className={`w-full py-2 text-xs rounded ${selectedYear==='all'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Years</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Month picker */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Month</h4>
                  <div className="relative">
                    <button onClick={() => setShowMonthCalendar(!showMonthCalendar)} className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                      <span className="text-sm text-gray-800 font-medium">{selectedMonth}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMonthCalendar?'rotate-180':''}`}/>
                    </button>
                    {showMonthCalendar&&(
                      <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="grid grid-cols-3 gap-1.5">
                          {allMonths.map(m=>(
                            <button key={m} onClick={() => handleMonthSelect(m)} className={`py-2 text-xs rounded transition-all ${selectedMonth===m?'bg-blue-600 text-white':'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>{m.substring(0,3)}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Date picker */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Date</h4>
                  <div className="relative">
                    <button onClick={() => setShowDateCalendar(!showDateCalendar)} className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                      <span className="text-sm text-gray-800 font-medium">{selectedDate?format(selectedDate,'dd MMM yyyy'):'Select date'}</span>
                      <Calendar className="w-4 h-4 text-gray-500"/>
                    </button>
                    {showDateCalendar&&(
                      <div className="absolute z-10 mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="grid grid-cols-7 gap-0.5 mb-2">
                          {['S','M','T','W','T','F','S'].map((d,idx)=><div key={idx} className="text-xs font-medium text-gray-500 text-center py-1">{d}</div>)}
                          {Array.from({length:31},(_,i)=>i+1).map(day=>(
                            <button key={day} onClick={() => { const d=new Date(selectedYear==='all'?new Date().getFullYear():selectedYear,allMonths.indexOf(selectedMonth),day); handleDateSelect(d); }} className={`py-1 text-xs rounded transition-all ${selectedDate&&selectedDate.getDate()===day&&selectedDate.getMonth()===allMonths.indexOf(selectedMonth)?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-blue-50'}`}>{day}</button>
                          ))}
                        </div>
                        <button onClick={() => { const t=new Date(); handleDateSelect(t); setSelectedMonth(allMonths[t.getMonth()]); setSelectedYear(t.getFullYear()); }} className="w-full py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200">Today</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button onClick={applyRentActivityFilters} className="w-full px-1 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">Apply Filters</button>
                    <button onClick={resetAllRentFilters} className="w-full px-1 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">Reset All</button>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-800 mb-1">Active Filters</p>
                  <div className="space-y-1">
                    {[['Year', selectedYear==='all'?'All Years':String(selectedYear)],['Month',selectedMonth],['Date',selectedDate?format(selectedDate,'dd MMM yyyy'):'Not selected'],['Mode',String(comparisonMode)]].map(([k,v])=>(
                      <div key={k} className="flex items-center justify-between"><span className="text-xs text-gray-600">{k}:</span><span className="text-xs font-medium text-blue-700">{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}