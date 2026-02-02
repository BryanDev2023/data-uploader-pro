import { UpdateUserResponse, User } from "@/types/user";
import api from "./api.service";

const userService = {
    updateUser: async (updateUser: UpdateUserResponse, userId: string): Promise<User> => {
        // El backend no acepta _id en el body; usamos el userId del path.
        const { _id, ...payload } = updateUser as UpdateUserResponse & { _id?: string };
        const response = await api.patch(`/users/update-user/${userId}`, payload);
        return response.data;
    },
} as const;

export default userService;
