import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import JobQnA from './JobQnA';
import { useAuth, AuthContext } from '../../context/AuthContext';

jest.mock('axios');
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthContext: {
    Provider: ({ children }) => children,
  },
}));

const mockJob = {
    _id: 'job123',
    employer: 'employer123',
    company: 'Test Company',
    QnA: [
        {
            _id: 'qa123',
            author: 'user123',
            authorName: 'Job Seeker',
            questionInfo: [{ question: 'What is the salary?', datePosted: new Date('2023-01-01T00:00:00Z'), votes: [] }],
            answer: null,
        },
    ],
};

const mockUser = {
    _id: 'employer123',
    role: 'employer',
};

const mockAuthContext = {
    isAuthenticated: true,
    user: mockUser,
    isJobSeeker: () => false,
};

const renderComponent = (job = mockJob, user = mockUser, setErrorsMock = jest.fn()) => {
    useAuth.mockReturnValue({
        isAuthenticated: true,
        user,
        isJobSeeker: () => false,
    });

    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <JobQnA job={job} setErrors={setErrorsMock} setJob={jest.fn()} />
        </AuthContext.Provider>
    );
};

describe('JobQnA', () => {
    it('should display all questions submitted by job seekers', () => {
        renderComponent();

        console.log('Rendered component for test 1:');
        screen.debug(); // This will print the entire rendered DOM

        expect(screen.getByText('Questions & Answers')).toBeInTheDocument();
        console.log('Found "Questions & Answers"');

        expect(screen.getByText('Job Seeker')).toBeInTheDocument();
        console.log('Found "Job Seeker"');

        expect(screen.getByText('What is the salary?')).toBeInTheDocument();
        console.log('Found "What is the salary?"');
    });

    it('should save and display the response when an employer answers a question', async () => {
        axios.put.mockResolvedValue({
            data: {
                QnA: [
                    {
                        _id: 'qa123',
                        author: 'user123',
                        authorName: 'Job Seeker',
                        questionInfo: [{ question: 'What is the salary?', datePosted: new Date(), votes: [] }],
                        answer: 'The salary is competitive.',
                    },
                ],
            },
        });
    
        renderComponent();
    
        fireEvent.click(screen.getByText('Answer'));
        fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'The salary is competitive.' } });
        fireEvent.click(screen.getByText('Save'));
    
        await waitFor(() => {
            expect(screen.getByText('The salary is competitive.')).toBeInTheDocument();
        });
    });

    it('should keep the textarea open with user input if the server returns an error', async () => {
        axios.put.mockRejectedValue(new Error('Failed to update answer'));

        const setErrorsMock = jest.fn(); // Create a mock function for setErrors
      
        renderComponent(undefined, undefined, setErrorsMock);
      
        fireEvent.click(screen.getByText('Answer'));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'The salary is competitive.' } });
      
        await act(async () => {
          fireEvent.click(screen.getByText('Save'));
        });
      
        // Wait for the component to handle the failed submission
        await waitFor(() => {
          // Optionally, check that the axios.put call was made
          expect(axios.put).toHaveBeenCalled();
        });
      
        // Ensure that the answer is not displayed as a <p> element
        expect(screen.queryByText('The salary is competitive.', { selector: 'p' })).not.toBeInTheDocument();
      
        // Check that the textarea is still present and contains the user's input
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('The salary is competitive.');
      
        // Check that setErrors was called with the expected error message
        expect(setErrorsMock).toHaveBeenCalledWith([{ msg: 'Failed to update answer' }]);
      });
});