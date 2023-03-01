import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector,useDispatch } from "react-redux";
import { DateSelect,LetterDaySelect,TeacherSelect } from './';
import { NotFoundPage } from "..";
import { setAllAbsentUsers } from "../../store/coverageSlice";
import { Box,Container,Typography,Button,IconButton,Select,MenuItem,FormControl,List,ListItem,ListItemIcon,ListItemText} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const deleteButtonStyle = {
    height:'15px',
    width:'15px',
    textAlign:'center',
    fontSize:'10px',
    padding:'0px'
};

const nameStyle = {
    display:'flex',
    alignItems:'center',
    gap:'10px'
};

const CoveragesPage = () => {
    const dispatch = useDispatch()
    const { coverageDay,allAbsentUsers,dateSelected } = useSelector((state) => state.coverage);
    const [token, setToken] = useState(window.localStorage.getItem("token"));

    const deleteAbsence = async(event) => {
        await axios.delete(`/api/attendance/absences/${coverageDay.id}/${event.currentTarget.value}`);
        const absences = await axios.get(`/api/attendance/absences/${coverageDay.date}`);
        const userPromises = absences.data.map(absence => axios.get(`/api/users/${absence.user.id}`));
        const userResponses = await Promise.all(userPromises);
        const userAbsences = userResponses.map(response => response.data);
        dispatch(setAllAbsentUsers(userAbsences)); // setting the global list of absent users in Redux store
    };

    if(!token) return <NotFoundPage/>
    return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap:"30px",
                    //placeSelf: "center",
                    //placeItems: "center",
                    //placeContent: "center center",
                    position: "relative",
                    top: "5vh",
                }}
            >
            <Box sx={{display:"flex",flexDirection:"column",gap:"20px",alignItems:"center"}}>
                <Typography variant="h3" sx={{fontFamily:'Montserrat'}}>Absences/Coverages</Typography>
                <Box sx={{display:"flex",gap:"10px"}}>
                    <DateSelect/>{coverageDay && <Typography variant="h4"><Link to={'/single-day'} style={{textDecoration:"none"}}>{coverageDay.letterDay} day*</Link></Typography>}
                </Box>
                {!coverageDay && dateSelected && 
                <Box sx={{display:"flex",placeItems:"center",flexDirection:"column",gap:"10px"}}>
                    <Typography sx={{fontFamily:'Montserrat',color:'red'}}>No information about this date. Please select a letter day to get started.</Typography>
                    <LetterDaySelect/>
                </Box>}
                {coverageDay && <TeacherSelect/>}
            </Box>
            
            {coverageDay &&
                <Box sx={{display:"flex",flexWrap:"wrap",rowGap:"20px"}}>
                    {allAbsentUsers.map((user) => {
                        return (
                            <Box key={user.id} sx={{width:"33%"}}>
                                <Box>
                                    <Box style={nameStyle}>
                                        <Typography sx={{fontFamily:'Montserrat'}}>{user.fullName}</Typography>
                                        <IconButton size="small" value={user.id} onClick={deleteAbsence}>
                                            <HighlightOffIcon fontSize="small" />   
                                        </IconButton>
                                    </Box>
                                    <List>
                                        {user.classes.map((eachClass) =>{
                                            return (
                                                eachClass.letterDays.includes(coverageDay.letterDay) && 
                                                <ListItem disablePadding key={eachClass.id}>
                                                    <ListItemIcon >
                                                        <SchoolIcon sx={{fontSize:"20px"}}/>
                                                    </ListItemIcon>
                                                    <ListItemText sx={{fontFamily:'Montserrat'}}>
                                                        <Link to={`/coverages/${eachClass.id}/${eachClass.school}/${eachClass.period}/${coverageDay.letterDay}`}>{eachClass.name} - {eachClass.period}</Link>
                                                    </ListItemText>
                                                </ListItem>
                                            )
                                        })}
                                    </List>
                                </Box>
                            </Box>  
                        );
                    })}
                </Box>}
            </Box>
    );
};

export default CoveragesPage;