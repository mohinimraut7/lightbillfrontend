import React, { useEffect, useState } from 'react';
import AddConsumer from '../components/modals/AddConsumer';
import Button from '@mui/material/Button';
import {TextField} from '@mui/material';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { addConsumer,fetchConsumers,deleteConsumer,editConsumer } from '../store/actions/consumerActions';
import { DataGrid } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import './Rolemaster.css';
import { styled } from '@mui/material/styles';
import { CircularProgress} from '@mui/material';
import * as XLSX from 'xlsx';
import { baseUrl } from '../config/config';
const columns = (handleDeleteConsumer,handleEditConsumer)=>[
  { field: 'id', headerName: 'ID', width: 40 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    renderCell: (params) => (
      <>
        {/* <IconButton sx={{color:'#FFA534'}}  onClick={() => handleDeleteConsumer(params.row._id)}>
          <DeleteIcon />
        </IconButton> */}
        <IconButton sx={{color:'#23CCEF'}}  onClick={() => handleEditConsumer(params.row)}>
          <EditIcon />
        </IconButton>
      </>
    ),
  },
  { field: 'consumerNumber', headerName: 'CONSUMER NUMBER', width: 220 },
  { field: 'consumerAddress', headerName: 'CONSUMER ADDRESS', width: 180 },
  { field: 'ward', headerName: 'WARD', width: 180 },
  { field: 'meterPurpose', headerName: 'METER PURPOSE', width: 220 },
  { field: 'phaseType', headerName: 'PHASE TYPE', width: 150 },
 
  
 
];
const ConsumerComponent = () => {
  const dispatch = useDispatch();
  const { consumers, loading, error } = useSelector((state) => state?.consumers);
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
      const user = useSelector(state => state.auth.user);
  
const [consumerOpen,setConsumerOpen]=useState(false);
const [consumer, setConsumer] = useState('');
const [cnId, setCnId] = useState('');
const [currentConsumer, setCurrentConsumer] = useState(null);
  useEffect(() => {
    dispatch(fetchConsumers());
  }, [dispatch]);
  const handleAddConsumerOpen=()=>{
    setCurrentConsumer(null);
    setConsumerOpen(true)
  }

const importExcel = async (event) => {
  const file = event.target.files[0]; 
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Clean and format the data
    const cleanedData = jsonData.map(item => ({
      consumerNumber: item.consumerNumber || '',
      consumerAddress: item.consumerAddress || '',
      ward: item.ward || '',
      meterPurpose: item.meterPurpose || '',
      phaseType: item.phaseType || '',
    }));

    console.log("Total Records:", cleanedData.length);

    // Split data into chunks of 100 records each
    const chunkSize = 100;
    for (let i = 0; i < cleanedData.length; i += chunkSize) {
      const chunk = cleanedData.slice(i, i + chunkSize);

      try {
        const response = await fetch(`${baseUrl}/import-excel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunk),
        });

        const result = await response.json();
        console.log(`Batch ${i / chunkSize + 1} imported successfully:`, result);
      } catch (error) {
        console.error(`Error importing batch ${i / chunkSize + 1}:`, error);
      }
    }

    alert("Excel data import process completed.");
  };

  reader.readAsArrayBuffer(file);
};
  
  const deleteAllConsumers = () => {
    fetch(`${baseUrl}/deleteAll`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('All consumers deleted:', data);
        alert(data.message); 
      })
      .catch((error) => {
        console.error('Error deleting consumers:', error);
        alert('Error deleting consumers');
      });
  };
  
  
  const handleAddConsumerClose=()=>{
    setConsumerOpen(false)
  }
  const handleAddConsumer = (consumerData) => {
    dispatch(addConsumer(consumerData));
    handleAddConsumerClose();
  };
  const handleEditConsumer = (consumer) => {
    setCurrentConsumer(consumer); 
    setConsumerOpen(true);
  };
  const handleDeleteConsumer = (consumerId) => {
    dispatch(deleteConsumer(consumerId));
  };

  const handleChange = (event) => {
    setCnId(event.target.value);
  };
  
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

  

  // let filteredData = cnId
  // ? consumers.filter(consumer => consumer.consumerNumber.includes(cnId))
  // : consumers;


  let filteredData = consumers?.filter(consumer => {
    // First, filter by consumerNumber if cnId is provided
    const matchesConsumerNumber = cnId ? consumer.consumerNumber.includes(cnId) : true;
    
    // Then, filter by ward if the user is a Junior Engineer
    const matchesWard = user?.role === 'Junior Engineer' ? consumer.ward === user.ward : true;
  
    return matchesConsumerNumber && matchesWard;
  });
  


  const rows = filteredData?.map((consumer,index) => ({
    id:index+1,
    _id:consumer._id,
    
    consumerNumber:consumer?.consumerNumber||'-',
    consumerAddress: consumer?.consumerAddress||'-',
    ward:consumer?.ward||'-',
    meterPurpose:consumer?.meterPurpose||'-',
    phaseType: consumer?.phaseType||'-',
    
     }));
  const gridStyle = {
    height: 'auto',
    width: isSidebarOpen ? '80%' : '90%',
    marginLeft: isSidebarOpen ? '19%' : '7%',
    transition: 'margin-rleft 0.3s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 0px',
    paddingLeft: '10px',
  };
  const innerDivStyle = {
    border: '1px solid #F7F7F8',
    width: '99%',
    padding: '30px 10px',
  };
  const rowColors = ['#F7F9FB', 'white'];
  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-cell': {
      padding: theme.spacing(1),
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: rowColors[0],
      },
      '&:nth-of-type(even)': {
        backgroundColor: rowColors[1],
      },
    },
  }));
  return (
    <div style={gridStyle}>
      <Box sx={innerDivStyle}>
      <Box sx={{   width:'100%',display:'flex',justifyContent:{
        xl:'space-between',
        lg:'space-between',
        md:'center',
        xs:'center'
      },
      alignItems:{
        xl:'flex-start',
        lg:'flex-start',
        md:'start',
      sm:'center',
      xs:'center'
      },
      
      mb:2,flexDirection:{
      lg:'row',
      xl:'row',
      md:'row',
      sm:'column',
      xs:'column'
    }}}>
        <Typography  style={{paddingLeft:'20px',color:'#0d2136'}} className='title-2'>CONSUMER MASTER</Typography>

<Box sx={{display:'flex',width:{
  xl:'45%',
  lg:'30%',
  md:'45%',
  sm:'80%',
  xs:'80%'
},justifyContent:'space-between', flexDirection:{
      lg:'row',
      xl:'row',
      md:'row',
      sm:'column',
      xs:'column'
    }}}>




      
{/* <Button
size="small"
  component="label"
  sx={{
    color: '#23CCEF',
    border: '0.1px solid #23CCEF',
    cursor: 'pointer',
    textTransform: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    width: 'auto',
   
  }}
  onClick={deleteAllConsumers}
>
  <AddIcon />
  <Typography>Delete All</Typography>

</Button> */}


<Button
  component="label"
  sx={{
    color: '#23CCEF',
    border: '0.1px solid #23CCEF',
    cursor: 'pointer',
    textTransform: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    width: 'auto',
   
   
  }}
>
  <AddIcon sx={{ marginLeft: '2px' }} />
  <Typography>Import Excel</Typography>
  <input type="file" hidden onChange={importExcel} accept=".xlsx, .xls" />
</Button>


<Button
            sx={{
              color: '#23CCEF',
              border: '0.1px solid #23CCEF',
              cursor: 'pointer',
              textTransform: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              width: 'auto',
            }}
            onClick={handleAddConsumerOpen}
          >
            <AddIcon sx={{ marginLeft: '2px' }} />
            <Typography>Add Consumer</Typography>
</Button>

</Box>

       


        </Box>
        <Box>
<TextField
    id="consumerNumber"
    name="consumerNumber"
    label="Search Consumer ID"
    value={cnId}
    onChange={
      handleChange}
    variant="outlined"
    InputProps={{
      sx: {
        height: '40px',
        mb:1
      },
    }}
    InputLabelProps={{
      sx: {
        color: 'gray',
        transform: 'translate(14px, 8px)',
        fontSize:'17px',
        transform: 'translate(14px, 8px)',
        '&.MuiInputLabel-shrink': {
transform: 'translate(14px, -8px) scale(0.75)', 
},
      },
     
    }}
    sx={{
      width: {
        xl: '30%',
        lg: '30%',
        md: '80%',
        sm: '80%',
        xs: '80%'
      }, 
      mt:{
        sm:1
      }
      
    }}
  />
</Box>
      <StyledDataGrid
      autoHeight  
        rows={rows}
        columns={columns(handleDeleteConsumer,handleEditConsumer)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10,15,20,25,100]}
        checkboxSelection
      />
      <AddConsumer
      open={consumerOpen}
      handleClose={ handleAddConsumerClose}
      handleAddConsumer={handleAddConsumer}
      currentConsumer={currentConsumer}
      editConsumer={(consumerId, consumerData) => {
        dispatch(editConsumer(consumerId, consumerData));
        dispatch(fetchConsumers());
      }}
      />
      </Box>
    </div>
  );
};
export default ConsumerComponent;