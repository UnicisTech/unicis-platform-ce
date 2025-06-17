import { useRouter } from 'next/router'
import { Badge } from '@/components/shadcn/ui/badge'
import { Button } from '@/components/shadcn/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card'
import { Category } from '@prisma/client'
import { TeamCourseWithProgress } from 'types'
import ProgressBadge from '../shared/ProgressBadge'
import { cn } from '@/components/shadcn/lib/utils'

const CourseCard = ({
  teamCourse,
  categories,
}: {
  teamCourse: TeamCourseWithProgress
  categories: Category[]
}) => {
  const router = useRouter()

  const openCourse = () => {
    router.push(`${router.asPath}/${teamCourse.id}`)
  }

  const course = teamCourse.course

  return (
    <Card
      onClick={openCourse}
      className={cn(
        'w-[350px] m-4 cursor-pointer transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02]'
      )}
    >
      <div className="relative pt-[70%]">
        <img
          className="absolute top-0 left-0 w-full h-full object-cover rounded-t-md"
          src={course?.thumbnail || '/unicis-iap-logo.png'}
          alt="Course Thumbnail"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{course.name}</CardTitle>
        <div className="flex justify-start mt-1">
          <Badge variant="outline">
            {categories.find(({ id }) => id === course.categoryId)?.name || ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <ProgressBadge progress={teamCourse.progress?.[0]?.progress} />
        {course?.estimatedTime && (
          <p className="text-sm text-muted-foreground">
            Estimated: {course.estimatedTime} minutes
          </p>
        )}
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            openCourse()
          }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  )
}

export default CourseCard
