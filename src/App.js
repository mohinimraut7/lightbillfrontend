import { useEffect,useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Button from '@mui/material/Button';
import User from './pages/User';
import Home from './pages/Home';
import Rolemaster from './pages/Rolemaster';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ConsumerBill from './pages/ConsumerBill';
import Profile from './pages/auth/Profile';
import ApprovedStatusRecord from './pages/ApprovedStatusRecord';
import PaidBills from './pages/PaidBills';
import PartialPaidBills from './pages/PartialPaidBills';
import MassApprovalsBills from './pages/MassApprovalsBills';
import UsersUpcomingDueBills from './pages/UsersUpcomingDueBills';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchBills } from './store/actions/billActions';
import ConsumerBillDetails from './pages/ConsumerBillDetails';
import MeterComponent from './pages/MeterComponents';
import TarriffMaster from './pages/TarriffMaster';
import OverdueBills from './pages/Overduebills';
import Overduebills from './pages/Overduebills';
import ConsumerComponent from './pages/ConsumerComponents';
import Formonetwentynew from './pages/Formonetwentynew';
import BillingAnomaly from './pages/BillingAnomaly';
import { upComingDueBills } from './utils/DueBillHelper';
import RegionalEnergyExpenditure from './pages/RegionalEnergyExpenditure';


const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { bills} = useSelector((state) => state.bills);
  const toastIdRef = useRef(null);

  const today = new Date(); 
  
  // const dueAlertrows = bills.filter(bill => {
  //   const dueDate = new Date(bill.dueDate);
  //   const twoDaysBeforeDue = new Date(dueDate);
  //   twoDaysBeforeDue.setDate(dueDate.getDate() - 2);
  //   if (user?.role === 'Junior Engineer') {
  //     return today >= twoDaysBeforeDue && today <= dueDate && bill.paymentStatus === 'unpaid'&&user?.ward === bill?.ward;;
      
  //   }
    
  //   return today >= twoDaysBeforeDue && today <= dueDate && bill.paymentStatus === 'unpaid'
  // });
  // const dueAlertCount = dueAlertrows.length;

  // ==============================================================================
//   const dueAlertrows = bills.filter(bill => {
//     const dueDate = new Date(bill.dueDate);
//     dueDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

//     // Calculate two days after today
//     const twoDaysAfter = new Date(today);
//     twoDaysAfter.setDate(today.getDate() + 2);
//     twoDaysAfter.setHours(0, 0, 0, 0);

//     // Check if the due date is between today and two days from now (inclusive)
//     const isWithinRange = dueDate >= today && dueDate <= twoDaysAfter;

//     if (user?.role === 'Junior Engineer') {
//         return isWithinRange && bill.paymentStatus === 'unpaid' && user?.ward === bill?.ward;
//     }
    
//     return isWithinRange && bill.paymentStatus === 'unpaid';
// });

// const dueAlertCount = dueAlertrows.length;
// =========================================================================

// const dueAlertrows = bills.filter(bill => {
//   const dueDate = new Date(bill.dueDate);
//   dueDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

//   // Calculate two days before the due date
//   const twoDaysBeforeDue = new Date(dueDate);
//   twoDaysBeforeDue.setDate(dueDate.getDate() - 2);
  
//   // Check if the bill's due date falls within the range of two days before due date and the due date itself
//   const isWithinRange = today >= twoDaysBeforeDue && today <= dueDate;

//   if (user?.role === 'Junior Engineer') {
//       return isWithinRange && bill.paymentStatus === 'unpaid' && user?.ward === bill?.ward;
//   }
  
//   return isWithinRange && bill.paymentStatus === 'unpaid';
// });
const dueAlertrows = upComingDueBills(bills, user);

const dueAlertCount = dueAlertrows.length;

  
  
  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  useEffect(() => {
    const storedData = localStorage.getItem("resdata");
    if (storedData) {
      const resData = JSON.parse(storedData);
      if (resData.token) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: resData,
        });
        navigate('/');
      }
    }
  }, [dispatch]);

  


  useEffect(() => {
    let timer;

    const showToast = () => {
      if (dueAlertCount === 0 || !isAuthenticated || toastIdRef.current) return; 

      const alertCount = dueAlertCount;
      const isSmallScreen = window.innerWidth <= 599;
      const isMediumScreen = window.innerWidth >= 600 && window.innerWidth <= 900;

      
      toastIdRef.current = toast.error(
        `Reminder: You have a total of ${alertCount} pending light bills. Please ensure that you do not cross the due date, as late payments will incur additional charges.`,
        {
          position: 'top-center',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: '#FAFAFA',
            color: '#000',
            width: isSmallScreen ? '350px' : isMediumScreen ? '599px' : '600px',
            height: isSmallScreen ? '80px' : '60px',
            fontSize: isSmallScreen ? '11px' : '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }
      );
    };

    if (bills.length > 0 && isAuthenticated) {
      timer = setTimeout(showToast, 6000);

      return () => {
        if (timer) clearTimeout(timer);
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      };
    }
  }, [bills.length, dueAlertCount, isAuthenticated]);

  
  const handleLogout = () => {
    localStorage.removeItem("resdata");
    dispatch({ type: "LOGOUT" });
    navigate('/login');
  };

  return (
    <>
  
          <Sidebar />
      <Routes>
       
        {isAuthenticated ? (
          <>
           <Route path="/" element={<Home />} />
            <Route path="/users" element={<User />} />
            <Route path="/consumer-bill-details/:id" element={<ConsumerBillDetails />} />
            <Route path="/specificconsumerbills" element={<ConsumerBillDetails />} />
            <Route path="/formonetwentynew" element={<Formonetwentynew />} />
            <Route path="/rolemaster" element={<Rolemaster />} />
            <Route path="/bills" element={<ConsumerBill />} />
            <Route path="/tarriffscomponent" element={<TarriffMaster />} />
            <Route path="/metercomponent" element={<MeterComponent />} />
            <Route path="/consumercomponent" element={<ConsumerComponent />} />
            <Route path="/usersupcomingduebills" element={<UsersUpcomingDueBills />} />
            <Route path="/overduebills" element={<Overduebills/>} />
            <Route path="/massapprovalsbills" element={<MassApprovalsBills />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pendingapprovals" element={<ApprovedStatusRecord/>} />
            <Route path='/billinganomaly' element={<BillingAnomaly/>}/>
            <Route path='/paidbills' element={<PaidBills/>}/>
            <Route path='/partialpaidbills' element={<PartialPaidBills/>}/>
            <Route path='/regionalenergyexpenditure' element={<RegionalEnergyExpenditure/>}>Regional Energy Expenditure</Route>
            <Route path="/logout" element={<Button sx={{ color: '#0d2136' }} onClick={handleLogout}>Logout</Button>} />
           
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </>
  );
};
export default App;
  
