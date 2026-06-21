'use client';

import Button from '@/components/base/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type FlagsResponse = {
	ok: boolean;
	availableFlags: string[];
	enabledFlags: string[];
};

async function parseError(res: Response): Promise<string> {
	const body = await res.json().catch(() => null);
	return body?.error ?? 'Request failed';
}

export default function Flags() {
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery<FlagsResponse>({
		queryKey: ['admin', 'flags'],
		queryFn: async () => {
			const res = await fetch('/api/admin/flags');
			if (!res.ok) throw new Error('Failed to load flags');
			return res.json();
		},
	});

	const toggleMutation = useMutation({
		mutationFn: async (flag: string) => {
			const res = await fetch('/api/admin/flags', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ flag }),
			});
			if (!res.ok) throw new Error(await parseError(res));
			return res.json() as Promise<FlagsResponse>;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['admin', 'flags'], data);
		},
		onError: (err: Error) => alert(err.message),
	});

	if (isLoading) return <p>Loading...</p>;
	if (isError || !data) return <p>Failed to load flags.</p>;

	return (
		<div className='flex flex-col gap-3'>
			<table className='w-full border-collapse'>
				<thead>
					<tr className='border-b-2 border-dotted text-left'>
						<th className='py-2'>Flag</th>
						<th className='py-2'>Status</th>
						<th className='py-2'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.availableFlags.map((flag) => {
						const enabled = data.enabledFlags.includes(flag);
						return (
							<tr key={flag} className='border-b border-dotted'>
								<td className='py-2 font-mono'>{flag}</td>
								<td className='py-2'>{enabled ? 'Enabled' : 'Disabled'}</td>
								<td className='py-2'>
									<Button
										onClick={() => toggleMutation.mutate(flag)}
										disabled={toggleMutation.isPending}
									>
										{enabled ? 'Disable' : 'Enable'}
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
