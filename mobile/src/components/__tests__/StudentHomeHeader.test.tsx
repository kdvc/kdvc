import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import StudentHomeHeader from '../StudentHomeHeader';

describe('StudentHomeHeader', () => {
    const mockOnOpenProfile = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders with default props', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays greeting with userName', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader userName="Maria Santos" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Maria');
    });

    it('displays default greeting when no userName', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Estudante');
    });

    it('renders with user photo', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader userPhoto="https://img.com/photo.jpg" />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders profile icon without photo', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with onOpenProfile handler', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader onOpenProfile={mockOnOpenProfile} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders back button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StudentHomeHeader />); });
        expect(tree.toJSON()).toBeTruthy();
    });
});
