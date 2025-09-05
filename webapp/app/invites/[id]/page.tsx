'use client';

import { useParams, useRouter } from 'next/navigation';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, CheckCircle2, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function InviteContent() {
    const params = useParams();
    const router = useRouter();
    const inviteId = params.id as string;
    const [copied, setCopied] = useState(false);

    const { data, isLoading, error } = db.useQuery({
        inviteLink: {
            $: {
                where: {
                    id: inviteId
                }
            },
            inviter: {},
            invitees: {}
        }
    });

    const invite = data?.inviteLink?.[0];
    const invitee = invite?.invitees?.[0];
    const inviter = invite?.inviter;

    const inviteUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/join/${invite?.code}`
        : '';

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading invite...</div>
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-red-500">Invite not found</div>
                <Button asChild variant="outline">
                    <Link href="/community">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Community
                    </Link>
                </Button>
            </div>
        );
    }

    const isAccepted = !!invite.fulfilledAt;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Invite Details
                </h1>
                <Button asChild variant="outline" size="sm">
                    <Link href="/community">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
            </div>

            <Card className="overflow-hidden border-gray-200">
                <div className={`p-2 ${isAccepted ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center justify-center gap-2">
                        {isAccepted ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-800">Invite Accepted!</span>
                            </>
                        ) : (
                            <>
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium text-yellow-800">Pending Acceptance</span>
                            </>
                        )}
                    </div>
                </div>

                <CardContent className="pt-6 space-y-6">
                    {/* Invite For */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Invite For</h3>
                        <div className="flex items-center gap-3">
                            <Send className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-semibold text-lg">{invitee?.name || 'Unknown'}</p>
                                {invitee?.tagline && (
                                    <p className="text-sm text-gray-600">{invitee.tagline}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Invited By */}
                    {inviter && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Invited By</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                    {inviter.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium">{inviter.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invite Link */}
                    {!isAccepted && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Invite Link</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inviteUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono"
                                />
                                <Button
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Share this link with {invitee?.name} to invite them to join
                            </p>
                        </div>
                    )}

                    {/* Created Date */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Created</h3>
                        <p className="text-gray-700">
                            {new Date(invite.createdAt || Date.now()).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Accepted Date */}
                    {isAccepted && invite.fulfilledAt && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">Accepted</h3>
                            <p className="text-gray-700">
                                {new Date(invite.fulfilledAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button asChild variant="outline">
                    <Link href="/community">
                        View All Invites
                    </Link>
                </Button>
                {invitee && (
                    <Button asChild>
                        <Link href={`/profiles/${invitee.id}`}>
                            View Profile
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <ClerkSignedInComponent>
            <InviteContent />
        </ClerkSignedInComponent>
    );
}