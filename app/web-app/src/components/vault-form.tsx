"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns"
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const createVaultFormSchema = z.object({
    fundingTokenAddress: z.string({
        required_error: 'Funding Token Address is required.'
    }),
    votingTokenAddress: z.string({
        required_error: 'Voting Token Address is required.'
    }),
    minRequestableAmount: z.number({
        required_error: 'Minimum Requestable Amount is required.'
    }),
    maxRequestableAmount: z.number({
        required_error: 'Maximum Requestable Amount is required.'
    }),
    tallyDate: z.date({
        required_error: 'Tally Date is required.'
    }),
})

export default function VaultForm() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const form = useForm<z.infer<typeof createVaultFormSchema>>({
        resolver: zodResolver(createVaultFormSchema),
    });
    const isLoading = form.formState.isLoading;

    async function handleSubmit(data: z.infer<typeof createVaultFormSchema>) {
        try {
            if (!isConnected || !address) {
                return;
            }
            console.log('[VAULT FORM]: Creating vault with data: ', data);

        } catch (err) {
            // TODO: add toast
            console.log('[VAULT FORM]: Error creating vault: ', err);
        }
    }


    return (
        <div className="h-full p-4 space-y-3 max-w-4xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium">
                            Create a new funding vault
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            This will deploy a new funding vault smart contract.
                        </p>
                    </div>
                    <Separator className="bg-primary/10" />
                    <div className="grid grid-col-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="fundingTokenAddress"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>
                                            Funding Token Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Token address here..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The address of the token that will be used to fund the accepted proposals.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            name="votingTokenAddress"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>
                                            Voting Token Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Token address here..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The voting token holders will have to lock their voting tokens in order to vote the proposals.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            name="minRequestableAmount"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>
                                            Minimum Requestable Amount
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Minimum amount here..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The minimum amount that can be requested by a proposal.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            name="maxRequestableAmount"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>
                                            Maximum Requestable Amount
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Maximum amount here..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The maximum amount that can be requested by a proposal.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            name="tallyDate"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>
                                            Tally Date
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "font-normal w-full flex justify-between items-center",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Date after which the funds will be distributed to the addresses that represent the selected proposals.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    </div>
                    <div className="w-full flex justify-center">
                        <Button size={"lg"} disabled={isLoading}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}