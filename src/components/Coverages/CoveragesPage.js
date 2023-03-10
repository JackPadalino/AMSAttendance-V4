import axios from 'axios';
import React, { useRef,useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector,useDispatch } from "react-redux";
import { DateSelect,LetterDaySelect,TeacherSelect } from './';
import { NotFoundPage } from "..";
import { setAllAbsentUsers,setAllCoverages,setTodaysCoverages } from "../../store/coverageSlice";
import { setAllUsers } from "../../store/userSlice";
import { Box,Typography,IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { 
    mainContainer,
    titleDateContainer,
    title,
    dateNotFound,
    letterDaySelect,
    pageLeftRightBox,
    pageLeftBox,
    letterDay,
    pageRightBox,
    teacherBox,
    teacherNameDelete,
    teacherName,
    classTitle,
    coveringTeacher
} from "./style";

const CoveragesPage = () => {
    const dispatch = useDispatch()
    const { coverageDay,allAbsentUsers,allCoverages,todaysCoverages,todaysCoveredClassesIds } = useSelector((state) => state.coverage);
    const [token, setToken] = useState(window.localStorage.getItem("token"));

    const deleteAbsence = async(event) => {
        // deleting the coverages associated with this absence first
        const userId = event.currentTarget.value;
        const absentUser = allAbsentUsers.find((user)=>user.id===userId);
        const classesCovered = absentUser.classes.filter((eachClass)=>eachClass.letterDays.includes(coverageDay.letterDay));
        const classesCoveredIds = classesCovered.map((eachClass)=>eachClass.id);
        const coveragesToDelete = todaysCoverages.filter((coverage)=>classesCoveredIds.includes(coverage.class.id));
        const coveragePromises = coveragesToDelete.map((coverage)=> axios.delete(`/api/coverages/${coverage.id}`));
        await Promise.all(coveragePromises);

        // now deleting this absence
        await axios.delete(`/api/attendance/absences/${coverageDay.id}/${userId}`);
        const absences = await axios.get(`/api/attendance/absences/${coverageDay.date}`);
        const userPromises = absences.data.map(absence => axios.get(`/api/users/${absence.user.id}`));
        const userResponses = await Promise.all(userPromises);
        const userAbsences = userResponses.map(response => response.data);
        dispatch(setAllAbsentUsers(userAbsences));

        // updating front end
        const updatedCoverages = await axios.get("/api/coverages");
        dispatch(setAllCoverages(updatedCoverages.data));
        const updatedTodaysCoverages = updatedCoverages.data.filter((coverage)=>coverage.dayId===coverageDay.id);
        dispatch(setTodaysCoverages(updatedTodaysCoverages));
        const updatedUsers = await axios.get('/api/users')
        dispatch(setAllUsers(updatedUsers.data));
    };
    
    if(!token) return <NotFoundPage/>
    return (
        <Box sx={mainContainer}>
            <Box sx={titleDateContainer}>
                <Typography variant="h3" sx={title}>Absences/Coverages</Typography>
                {Object.keys(coverageDay).length===0 && <Typography sx={dateNotFound}>No information about this date. Please select a date/letter day to get started.</Typography>}
                
                <Box sx={letterDaySelect}>
                    <DateSelect/> {Object.keys(coverageDay).length===0 ?
                    <LetterDaySelect/> :
                    <Box sx={{display:"flex",alignItems:"center"}}>
                        <Typography variant="h4"><Link to={'/single-day'} style={letterDay} className="letterDay">{coverageDay.letterDay} Day</Link></Typography>
                    </Box>}
                </Box>
            </Box>
            {Object.keys(coverageDay).length > 0 &&
                <Box sx={pageLeftRightBox}>
                    <Box sx={pageLeftBox}>
                        <TeacherSelect/>
                    </Box>
                    <Box sx={pageRightBox}>
                        {allAbsentUsers.map((user) => {
                            return (
                                <Box key={user.id} sx={teacherBox}>
                                        <Box sx={teacherNameDelete}>
                                            <Typography sx={teacherName}>{user.fullName}</Typography>
                                            <IconButton size="small" value={user.id} onClick={deleteAbsence}>
                                                <HighlightOffIcon fontSize="small" />   
                                            </IconButton>
                                        </Box>
                                        <Box>
                                            {user.classes.map((eachClass) =>{
                                                return (
                                                    eachClass.letterDays.includes(coverageDay.letterDay) && 
                                                    <Box key={eachClass.id}>
                                                        <Typography sx={classTitle} align="center">
                                                            <Link to={`/coverages/${eachClass.id}/${eachClass.school}/${eachClass.period}/${coverageDay.letterDay}`} style={{textDecoration:"none",color:"#1976D2"}}>{eachClass.name} - {eachClass.period}</Link>
                                                        </Typography>
                                                        {todaysCoverages.map((eachCoverage)=>{
                                                                return (
                                                                    eachCoverage.class.id===eachClass.id &&
                                                                    <Typography sx={coveringTeacher} align="center">{eachCoverage.user.fullName}</Typography>
                                                                )
                                                            })}
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                </Box>  
                            );
                        })}
                    </Box>
                </Box>}

        </Box>
    );
};

export default CoveragesPage;