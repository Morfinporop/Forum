import { useForumContext } from '../store';
import { Application, ApplicationResponse, MediaFile } from '../types';

export function useApplications() {
  const { state, dispatch } = useForumContext();

  const createApplication = (
    authorId: string,
    type: Application['type'],
    title: string,
    content: string,
    media: MediaFile[]
  ) => {
    const application: Application = {
      id: crypto.randomUUID(),
      authorId,
      type,
      title,
      content,
      media,
      status: 'pending',
      responses: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    dispatch({ type: 'ADD_APPLICATION', payload: application });
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    const data: Partial<Application> = { status, updatedAt: Date.now() };
    if (status === 'closed') {
      data.closedAt = Date.now();
    }
    dispatch({ type: 'UPDATE_APPLICATION', payload: { id, data } });
  };

  const addApplicationResponse = (applicationId: string, authorId: string, content: string) => {
    const app = state.applications.find((a: Application) => a.id === applicationId);
    if (!app) return;
    const response: ApplicationResponse = {
      id: crypto.randomUUID(),
      authorId,
      content,
      createdAt: Date.now()
    };
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: {
        id: applicationId,
        data: {
          responses: [...app.responses, response],
          updatedAt: Date.now()
        }
      }
    });
  };

  const deleteApplication = (id: string) => {
    dispatch({ type: 'DELETE_APPLICATION', payload: id });
  };

  return {
    applications: state.applications,
    createApplication,
    updateApplicationStatus,
    addApplicationResponse,
    deleteApplication
  };
}
