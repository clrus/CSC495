import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Button,
  Card,
  Grid,
  Typography,
} from '@mui/material'
import parse from 'html-react-parser'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ProblemType } from '@/enum'
import { useInstructorCheck } from '@/hooks'
import { useNotification } from '@/hooks/useNotification'
import { Problem } from '@/types/problem'
import { getAiReviewSpecs, getAiSeverity, navigateUp } from '@/util'

import { ProblemAuthorChip, SolutionAuthorsChip } from './authors'
import { problemService } from './problem.service'

export const ReviewProblem = (props: { problemType: ProblemType; problem?: Problem }) => {
  useInstructorCheck()
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useNotification()
  const aiAlert = useMemo(
    () => (props.problem?.aiReview ? getAiSeverity(props.problem.aiReview.aiScore) : null),
    [props.problem?.aiReview]
  )
  const aiText = useMemo(
    () => getAiReviewSpecs(props.problem?.aiReview?.aiScore ?? 0)?.text,
    [props.problem?.aiReview?.aiScore]
  )
  const [solutionAuthors, setSolutionAuthors] = useState([])

  useEffect(() => {
    if (props.problem) {
      problemService.getSolutionAuthors(props.problem.uuid).then((res) => setSolutionAuthors(res))
    }
  }, [props.problem])

  const approve = () =>
    problemService
      .approveProblem(props.problem?.uuid ?? '')
      .then(() => {
        notify({
          message: 'Success! Solution has been approved and is posted.',
          severity: 'success',
        })
        navigate(navigateUp(location.pathname, 1))
      })
      .catch(() => console.log('An unknown error has occurred'))

  const reject = () =>
    problemService
      .deleteProblem(props.problem?.uuid ?? '')
      .then(() => {
        notify({
          message: 'Success! Solution has been deleted.',
          severity: 'success',
        })
        navigate(navigateUp(location.pathname, 1))
      })
      .catch(() => console.log('An unknown error has occurred'))

  return (
    <Grid p={5} width={'70vw'}>
      <Typography textTransform={'capitalize'} variant={'h4'}>
        {props.problemType} Problem
      </Typography>
      <Grid container py={3} direction={'column'} gap={2} width={'100%'}>
        <Typography variant={'h5'}>Problem</Typography>
        <Typography variant="h6">{props.problem?.title}</Typography>
        <ProblemAuthorChip solutionAuthors={solutionAuthors} />
        <Card sx={{ p: 2 }}>{parse(props.problem?.body ?? '')}</Card>
      </Grid>
      <Grid container direction={'column'} gap={2} width={'100%'} mt={5}>
        <Typography variant={'h5'}>Solution</Typography>
        <Typography color={'#B0B0B0'}>The student submitted the following solution.</Typography>
        <SolutionAuthorsChip solutionAuthors={solutionAuthors} />
        <Card sx={{ p: 2 }}>{parse(props.problem?.solution ?? '')}</Card>
      </Grid>
      <Grid container direction="column" sx={{ mt: 7 }} gap={2}>
        {aiAlert && (
          <Alert severity={aiAlert}>
            <AlertTitle>AI Review: {aiText}</AlertTitle>
            Our AI model has reviewed the student&apos;s solution attempt and has given it a score
            of <strong>{props.problem?.aiReview?.aiScore}</strong> out of <strong>10</strong>.
            <Accordion
              elevation={0}
              sx={{
                width: 'fit-content',
                background: 'none',
                border: 'none',
                '&::before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                sx={{ width: 'fit-content', columnGap: 3 }}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Details
              </AccordionSummary>
              <AccordionDetails>{props.problem?.aiReview?.aiReason}</AccordionDetails>
            </Accordion>
          </Alert>
        )}
        <Grid>
          <Button onClick={approve} variant={'contained'} sx={{ mr: 1 }}>
            Accept
          </Button>
          <Button onClick={reject} variant={'outlined'}>
            Delete
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
