import prisma from '@/lib/db';
import { getTokenName } from '@/lib/get-token-name';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        
        const token = await req.json();

        const fundingTokenSymbol = await getTokenName(token);
        const votingTokenSymbol = await getTokenName(token);

        const res = {
            fundingTokenSymbol,votingTokenSymbol
        }
       
        return NextResponse.json(res);
    } catch (err) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
