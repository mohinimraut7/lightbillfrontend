import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBills } from '../store/actions/billActions';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, Box, Tabs, Tab,Button } from '@mui/material';

import { CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import ConsumerButton from '../components/ConsumerButton';

const BillingAnomaly = () => {
  const dispatch = useDispatch();
  const { bills, loading, error } = useSelector((state) => state.bills);
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Sort bills by monthAndYear
  const sortedBills = [...bills].sort((a, b) => new Date(a.monthAndYear) - new Date(b.monthAndYear));
  const billMap = new Map();
  sortedBills.forEach((bill) => {
    if (!billMap.has(bill.consumerNumber)) {
      billMap.set(bill.consumerNumber, []);
    }
    billMap.get(bill.consumerNumber).push(bill);
  });

  const highBills = [];
  const lowBills = [];
  const zeroConsumptionBills = [];

  billMap.forEach((billHistory) => {
    if (billHistory.length < 2) return;
    
    const previousBill = billHistory[billHistory.length - 2];
    const currentBill = billHistory[billHistory.length - 1];

    const prevAmount = previousBill.netBillAmount;
    const currAmount = currentBill.netBillAmount;
    const highThreshold = prevAmount + prevAmount * 0.25;
    const lowThreshold = prevAmount - prevAmount * 0.25;

    if (currAmount >= highThreshold) {
      highBills.push({ ...currentBill, prevNetBillAmount: prevAmount });
    } else if (currAmount <= lowThreshold) {
      lowBills.push({ ...currentBill, prevNetBillAmount: prevAmount });
    }

    // if (currentBill.totalConsumption === 0) {
    //   zeroConsumptionBills.push(currentBill);
    // }
    if (currentBill.totalConsumption === 0) {
        zeroConsumptionBills.push({ ...currentBill, prevNetBillAmount: previousBill.netBillAmount || 0 });
      }
  });
  const downloadAllTypsOfReport = () => {
    const rows = getRows();
      const worksheet = XLSX.utils.json_to_sheet(rows.map((row, index) =>({
        'ID': index+1,
        'Consumer No.': row.consumerNumber,
        'Ward': row.ward,
        'Meter Number': row.meterNumber,
        'Total Consumption': row.totalConsumption,
        'Meter Status': row.meterStatus,
        'billMonth':row.monthAndYear,
        'previousBillAmount':row.prevNetBillAmount,
        'Net Bill Amount': row.netBillAmount,
      })));
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
      XLSX.writeFile(workbook, 'ConsumerBills.xlsx');
    };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'consumerNumber', headerName: 'CONSUMER NUMBER', width: 140 },
    // { field: 'contactNumber', headerName: 'CONTACT NUMBER', width: 130 },
    { field: 'ward', headerName: 'WARD', width: 130 },
    { field: 'meterNumber', headerName: 'METER NUMBER', width: 130 },
    { field: 'totalConsumption', headerName: 'TOTAL CONSUMPTION', width: 130 },
    { field: 'meterStatus', headerName: 'METER STATUS', width: 130 },
    { field: 'monthAndYear', headerName: 'BILL MONTH', width: 130 },
    { field: 'prevNetBillAmount', headerName: 'PREVIOUS BILL AMOUNT', width: 150 },
    { field: 'netBillAmount', headerName: 'NET BILL AMOUNT', width: 150 },
  ];

  const getRows = () => {
    switch (tabValue) {
      case 0:
        return zeroConsumptionBills;
      case 1:
        return highBills;
      case 2:
        return lowBills;
      default:
        return [];
    }
  };

  return (
    <Box sx={{ width: '90%', marginLeft:isSidebarOpen?'250px':'100px',paddingTop: isSidebarOpen?'20px':'50px' }}>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Zero Consumption Bills" />
        <Tab label="High Anomaly Bills" />
        <Tab label="Low Anomaly Bills" />
      </Tabs>
      <Box sx={{mt:1}}><ConsumerButton onClick={downloadAllTypsOfReport} startIcon={<DownloadIcon/>}>Download Reports</ConsumerButton></Box>
      <Box sx={{ marginTop: '20px', border: '1px solid #F7F7F8', padding: '20px' }}>
        {/* <Typography >
          {tabValue === 0 ? 'ZERO CONSUMPTON BILLS' : tabValue === 1 ? 'HIGH ANOMALY BILLS' : 'LOW ANOMALY BILLS'}
        </Typography> */}
        <DataGrid rows={getRows().map((bill, index) => ({ id: index + 1, ...bill }))} columns={columns} pageSize={5} />
      </Box>
    </Box>
  );
};

export default BillingAnomaly;
