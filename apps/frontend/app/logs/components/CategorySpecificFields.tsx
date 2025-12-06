import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Control, FieldErrors } from 'react-hook-form';
import { difficultyLabels } from '../constants';
import { Event, LogCategory, LogFormData, Project } from '../types';
import { FormField } from './FormField';

interface CategorySpecificFieldsProps {
  category: LogCategory | undefined;
  control: Control<LogFormData>;
  errors: FieldErrors<LogFormData>;
  projects: Project[];
  events: Event[];
}

export function CategorySpecificFields({
  category,
  control,
  errors,
  projects,
  events,
}: CategorySpecificFieldsProps) {
  if (category === LogCategory.PROJECT) {
    return (
      <>
        <FormField
          name="projectId"
          label="Projekt"
          control={control}
          error={errors.projectId}
        >
          {(field) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Nincs projekt" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField
          name="difficulty"
          label="Nehézség"
          control={control}
          error={errors.difficulty}
        >
          {(field) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz nehézséget" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </>
    );
  }

  if (category === LogCategory.EVENT) {
    return (
      <FormField
        name="eventId"
        label="Esemény"
        control={control}
        error={errors.eventId}
      >
        {(field) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Válassz eseményt" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>
    );
  }

  return null;
}
