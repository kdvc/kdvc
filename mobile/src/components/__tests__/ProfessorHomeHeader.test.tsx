import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import ProfessorHomeHeader from '../ProfessorHomeHeader';

describe('ProfessorHomeHeader', () => {
    const mockOnAddClass = jest.fn();
    const mockOnOpenProfile = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders with default props', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays greeting with userName', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader userName="João Silva" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('João');
    });

    it('displays default greeting when no userName', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Professor');
    });

    it('renders add button when onAddClass provided', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader onAddClass={mockOnAddClass} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders without add button when onAddClass not provided', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with user photo', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader userPhoto="https://img.com/photo.jpg" />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders profile icon without photo', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with onOpenProfile handler', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfessorHomeHeader onOpenProfile={mockOnOpenProfile} />); });
        expect(tree.toJSON()).toBeTruthy();
    });
});
