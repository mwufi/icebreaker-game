'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface Comment {
    id: string;
    authorName?: string;
    dateText?: string;
    bodyText?: string;
    likes: number;
}

interface CommentsListProps {
    comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
    if (!comments || comments.length === 0) return null;

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                Comments ({comments.length})
            </h3>
            <div className="space-y-4">
                {comments.map((comment) => (
                    <Card key={comment.id} className="border-gray-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-semibold text-gray-900">
                                            {comment.authorName || 'Anonymous'}
                                        </span>
                                        <span className="text-gray-500 text-sm">• {comment.dateText}</span>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed">{comment.bodyText}</div>
                                    {comment.likes > 0 && (
                                        <div className="mt-3 text-sm text-gray-600 font-medium">
                                            ❤️ {comment.likes} like{comment.likes !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}