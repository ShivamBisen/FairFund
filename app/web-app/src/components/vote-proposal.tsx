"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { writeContract, readContract } from "@wagmi/core";
import { config as wagmiConfig } from "@/wagmi/config";
import { erc20ABI, fundingVaultABI } from "@/blockchain/constants";
import { type Proposal } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


interface VoteProposalButtonProps {
    className?: string;
    proposal: Proposal;
    votingTokenAddress: string;
    vaultAddress: string;
}

const voteProposalForm = z.object({
    amountOfTokens: z.string({
        required_error: "Amount of tokens is required",
    }),
})


export default function VoteProposal({
    className,
    proposal,
    votingTokenAddress,
    vaultAddress
}: VoteProposalButtonProps) {

    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof voteProposalForm>>({
        resolver: zodResolver(voteProposalForm),
        defaultValues: {
            amountOfTokens: ""
        }
    })

    async function handleSubmit(data: z.infer<typeof voteProposalForm>) {
        if (!isConnected || !address) {
            return;
        }
        try {
            const decimals = await readContract(wagmiConfig, {
                // @ts-ignore
                address: votingTokenAddress,
                abi: erc20ABI,
                functionName: 'decimals',
            })
            const amountOfTokens = parseUnits(data.amountOfTokens, decimals as number);
            console.log(proposal.id);
            
            const hash = await writeContract(wagmiConfig, {
                // @ts-ignore
                address: vaultAddress,
                abi: fundingVaultABI,
                functionName: 'voteOnProposal',
                args: [
                    proposal.proposalId,
                    amountOfTokens
                ]
            })
            if(hash){
                toast({
                    title: "Successfully Voted",
                    description: (
                        <div className="w-[80%] md:w-[340px]">
                            <p className="truncate">Transaction hash: <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a></p>
                        </div>
                    ),
                })
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error while voting to',
                description: 'Something went wrong. Please try again.'
            }) 
            console.log('[VOTE_PROPOSAL]: ', err);
        }
    }

    return (

        <Card className="m-6 pt-4 w-full">
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                        <FormField
                            name="amountOfTokens"
                            control={form.control}
                            render={({field})=>{
                                return (
                                    <FormItem>
                                        <FormLabel>
                                            Amount of Tokens
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="in ETH units."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The amount of votes you want to allocate to this proposal.
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                        <div className="w-full flex justify-center">
                            <Button size={"lg"}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}