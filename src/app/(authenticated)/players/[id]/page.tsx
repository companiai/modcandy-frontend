'use client';

import PlayerDetails from '@/components/PlayerDetails';

export default function PlayerDetailsPage({ params }: { params: { id: string } }) {
  return <PlayerDetails playerId={params.id} />;
} 