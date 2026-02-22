import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import PresenceCard from '../PresenceCard';

describe('PresenceCard', () => {
    it('renders with present status', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Presente');
    });

    it('renders with absent status', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={false} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Ausente');
    });

    it('displays date', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="15/03" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('15/03');
    });

    it('displays topic', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" topic="Aula Prática" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Aula Prática');
    });

    it('shows Chamada as default topic', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Chamada');
    });
});
