import { Inngest } from 'inngest';
import { UsersService } from '../users/users.service';

export const inngest = new Inngest({
  id: 'code-sync',
});

export function getInngestFunctions(usersService: UsersService) {
  const syncUser = inngest.createFunction(
    {
      id: 'sync-user',
      triggers: [{ event: 'clerk/user.created' }],
    },
    async ({ event }) => {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

      const newUser = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        profileImage: image_url || '',
      };

      await usersService.create(newUser);

      console.log('User created:', newUser);
    },
  );

  const deleteUser = inngest.createFunction(
    {
      id: 'delete-user',
      triggers: [{ event: 'clerk/user.deleted' }],
    },
    async ({ event }) => {
      const { id } = event.data;

      await usersService.remove(id);

      console.log('User deleted:', id);
    },
  );

  return [syncUser, deleteUser];
}
