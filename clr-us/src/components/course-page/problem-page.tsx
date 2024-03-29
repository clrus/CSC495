import AddIcon from '@mui/icons-material/Add'
import {
  Tab,
  Box,
  CircularProgress,
  Grid,
  List,
  Tabs,
  Typography,
  Divider,
  Button,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ProblemCard } from '@/components/course-page/problem-card'
import { Sidebar } from '@/components/navbar'
import useAuth from '@/context/context'
import { RouteList } from '@/enum'
import { useCourseCheck, useIsLarge } from '@/hooks'
import { useGetClassId } from '@/hooks/useGetClassId'
import { useGetProblemType } from '@/hooks/useGetProblemType'
import { Problem, ProblemStatus } from '@/types/problem'

import { CustomTabPanel } from '../tab-panel'

import { problemService } from './problem.service'

export const ProblemPage: React.FC = () => {
  useCourseCheck()
  const problemType = useGetProblemType()
  const classId = useGetClassId()
  const { user } = useAuth()
  const [postedProblems, setPostedProblems] = useState<Problem[] | undefined>(undefined)
  const [endorsedProblems, setEndorsedProblems] = useState<Problem[] | undefined>(undefined)
  const [reviewProblems, setReviewProblems] = useState<Problem[] | undefined>(undefined)
  const [tab, setTab] = useState(0)
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(
    () =>
      setIsInstructor(
        !!user?.courses.some((course) => course.oid === classId && course.role === 'Instructor')
      ),
    [user, classId, setIsInstructor]
  )

  useEffect(() => {
    if (problemType) {
      problemService.getProblems(classId, ProblemStatus.Posted, problemType, setPostedProblems)
      problemService.getProblems(classId, ProblemStatus.Endorsed, problemType, setEndorsedProblems)
      if (isInstructor) {
        problemService.getProblems(classId, ProblemStatus.Review, problemType, setReviewProblems)
      }
    }
  }, [
    problemType,
    classId,
    setPostedProblems,
    setEndorsedProblems,
    setReviewProblems,
    isInstructor,
  ])

  const counts = useCallback(
    (): Record<ProblemStatus, number> => ({
      [ProblemStatus.Review]: reviewProblems?.length ?? 0,
      [ProblemStatus.Posted]: postedProblems?.length ?? 0,
      [ProblemStatus.Endorsed]: endorsedProblems?.length ?? 0,
    }),
    [reviewProblems, endorsedProblems, postedProblems]
  )

  const getInProgressTabId = () => (isInstructor ? 1 : 0)
  const getEndorsedTabId = () => getInProgressTabId() + 1

  const largeScreen = useIsLarge()

  return (
    <Grid
      sx={{
        background: 'rgba(243, 246, 249, 0.6)',
        minHeight: '100vh',
        width: '100%',
        justifyContent: 'flex-start',
      }}
    >
      <Sidebar />
      <Grid
        direction="column"
        sx={{ my: largeScreen ? 0 : 2, mr: 2, ml: largeScreen ? '316px' : '16px' }}
      >
        <Grid container alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant="h5" sx={{ my: 4 }}>
            {problemType} Problems
          </Typography>
          <Link to={`${RouteList.Post}`}>
            <Button variant={'contained'} endIcon={<AddIcon />}>
              Post
            </Button>
          </Link>
        </Grid>
        <Box>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            aria-label="problem type tabs"
          >
            {isInstructor && (
              <Tab
                label={`Review (${counts()[ProblemStatus.Review]})`}
                id="tab-review"
                aria-controls="simple-tabpanel-0"
              />
            )}
            <Tab
              label={`In Progress (${counts()[ProblemStatus.Posted]})`}
              id="tab-in-progress"
              aria-controls={`simple-tabpanel-${getInProgressTabId()}`}
            />
            <Tab
              label={`Endorsed (${counts()[ProblemStatus.Endorsed]})`}
              id="tab-endorsed"
              aria-controls={`simple-tabpanel-${getEndorsedTabId()}`}
            />
          </Tabs>
        </Box>
        <Divider />
        {isInstructor && (
          <CustomTabPanel value={tab} index={0}>
            <Box>
              {reviewProblems ? (
                <List>
                  {reviewProblems.map((problem, key) => (
                    <ProblemCard key={key} problem={problem} />
                  ))}
                </List>
              ) : (
                <CircularProgress />
              )}
            </Box>
          </CustomTabPanel>
        )}
        <CustomTabPanel value={tab} index={getInProgressTabId()}>
          <Box>
            {postedProblems ? (
              <List>
                {postedProblems.map((problem, key) => (
                  <ProblemCard problem={problem} key={key} />
                ))}
              </List>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={getEndorsedTabId()}>
          <Box>
            {endorsedProblems ? (
              <List>
                {endorsedProblems.map((problem, key) => (
                  <ProblemCard problem={problem} key={key} />
                ))}
              </List>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </CustomTabPanel>
      </Grid>
    </Grid>
  )
}
