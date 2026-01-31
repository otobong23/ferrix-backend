import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/common/schemas/user/user.schema';
import { Model, Connection, ClientSession } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Crew, CrewDocument, CrewMember } from 'src/common/schemas/crew/userCrew.schema';
import { UserTransaction, UserTransactionDocument } from 'src/common/schemas/transaction/userTransaction.schema';
import { CrewService } from './crew.service';


@Injectable()
export class CrewExtraService {
   constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      @InjectModel(UserTransaction.name) private transactionModel: Model<UserTransactionDocument>,
      @InjectModel(Crew.name) private crewModel: Model<CrewDocument>,
      @InjectConnection() private readonly db: Connection,
      private readonly crewService: CrewService,
      private readonly jwtService: JwtService
   ) { }

   /**
  * @author Miracle Boniface
  * @module CrewService
  * @param {string} userID - ID of the user to delete
  * @function deleteUserDeep
  * @description Deep deletion - Deletes a user and ALL their crew members recursively
  * @export
  */
   async deleteUser(userID: string) {
      try {
         // 1. Find the user to be deleted
         const userToDelete = await this.userModel.findOne({ userID });
         if (!userToDelete) {
            throw new NotFoundException('User not found');
         }

         console.log(`🔥 Starting deep deletion for user: ${userToDelete.username}`);

         // 2. Get all users in the deletion hierarchy
         const usersToDelete = await this.getAllDownlineUsers(userID);
         console.log(`📊 Found ${usersToDelete.length} total users to delete (including root user)`);

         // 3. Delete in reverse order (deepest first) to avoid referential issues
         const deletionResults = {
            totalUsers: usersToDelete.length,
            deletedUsers: [] as Array<{ userID: string; username: string; level: number }>,
            deletedCrews: 0,
            deletedTransactions: 0,
            errors: [] as Array<{ userID: string; username: string; error: string }>,
         };

         // Sort by level (deepest first) then process
         usersToDelete.sort((a, b) => b.level - a.level);

         for (const userInfo of usersToDelete) {
            try {
               await this.deleteSingleUserComplete(userInfo.userID, userInfo.username);
               deletionResults.deletedUsers.push({
                  userID: userInfo.userID,
                  username: userInfo.username,
                  level: userInfo.level
               });
            } catch (error) {
               deletionResults.errors.push({
                  userID: userInfo.userID,
                  username: userInfo.username,
                  error: error.message
               });
               console.error(`❌ Error deleting user ${userInfo.username}:`, error.message);
            }
         }

         // 4. Clean up any remaining references
         await this.cleanupOrphanedReferences(usersToDelete.map(u => u.userID));

         console.log(`✅ Deep deletion completed. Deleted ${deletionResults.deletedUsers.length} users`);

         return {
            success: true,
            message: `Deep deletion completed for ${userToDelete.username} and ${deletionResults.totalUsers - 1} crew members`,
            details: deletionResults
         };

      } catch (error) {
         console.error('❌ Critical error in deep deletion:', error);
         throw new BadRequestException(`Failed to perform deep deletion: ${error.message}`);
      }
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string} rootUserID - Root user ID to start the search
    * @function getAllDownlineUsers
    * @description Recursively gets all users in the downline hierarchy
    * @private
    */
   private async getAllDownlineUsers(rootUserID: string, level: number = 0, visited: Set<string> = new Set()): Promise<Array<{ userID: string, username: string, level: number }>> {
      // Prevent infinite loops
      if (visited.has(rootUserID)) {
         return [];
      }
      visited.add(rootUserID);

      const user = await this.userModel.findOne({ userID: rootUserID });
      if (!user) return [];

      const result = [{
         userID: rootUserID,
         username: user.username,
         level
      }];

      // Get the user's crew to find their direct referrals
      const userCrew = await this.crewModel.findOne({ userID: rootUserID });
      if (!userCrew) return result;

      // Collect all crew members from all levels
      const allCrewMembers = [
         ...userCrew.level_1,
         ...userCrew.level_2,
         ...userCrew.level_3
      ];

      // Get direct referrals only (level_1 members)
      const directReferrals = userCrew.level_1;

      // Recursively get downline for each direct referral
      for (const member of directReferrals) {
         if (!visited.has(member.userID)) {
            const downline = await this.getAllDownlineUsers(member.userID, level + 1, visited);
            result.push(...downline);
         }
      }

      // Also find users referred by this user (in case crew data is inconsistent)
      const referredUsers = await this.userModel.find({ referredBy: user.referral_code });
      for (const referredUser of referredUsers) {
         if (!visited.has(referredUser.userID)) {
            const downline = await this.getAllDownlineUsers(referredUser.userID, level + 1, visited);
            result.push(...downline);
         }
      }

      return result;
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string} userID - User ID to delete
    * @param {string} username - Username for logging
    * @function deleteSingleUserComplete
    * @description Completely deletes a single user and all their data
    * @private
    */
   private async deleteSingleUserComplete(userID: string, username: string) {
      console.log(`🗑️ Deleting user: ${username} (${userID})`);

      // 1. Get user data before deletion
      const user = await this.userModel.findOne({ userID });
      if (!user) {
         console.log(`⚠️ User ${username} not found, skipping...`);
         return;
      }

      // 2. Delete user's crew
      const userCrew = await this.crewModel.findOne({ userID });
      if (userCrew) {
         await this.crewModel.deleteOne({ userID });
         console.log(`  ✅ Deleted crew for ${username}`);
      }

      // 3. Delete all user transactions
      const transactionCount = await this.transactionModel.countDocuments({ email: user.email });
      await this.transactionModel.deleteMany({ email: user.email });
      console.log(`  ✅ Deleted ${transactionCount} transactions for ${username}`);

      // 4. Remove user from all crews they're a member of
      await this.removeUserFromAllCrews(userID, username);

      // 5. Delete the user
      await this.userModel.deleteOne({ userID });
      console.log(`  ✅ Deleted user ${username}`);
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string} userID - ID of the user to remove
    * @param {string} username - Username of the user to remove
    * @function removeUserFromAllCrews
    * @description Removes a user from all crews they're a member of and updates stats
    * @private
    */
   private async removeUserFromAllCrews(userID: string, username: string) {
      // Find all crews that contain this user as a member
      const crewsWithUser = await this.crewModel.find({
         $or: [
            { 'level_1.userID': userID },
            { 'level_2.userID': userID },
            { 'level_3.userID': userID }
         ]
      });

      for (const crew of crewsWithUser) {
         let memberRemoved = false;
         let removedMember: CrewMember | null = null;

         // Check and remove from level_1
         const level1Index = crew.level_1.findIndex(member => member.userID === userID);
         if (level1Index > -1) {
            removedMember = crew.level_1[level1Index];
            crew.level_1.splice(level1Index, 1);
            memberRemoved = true;
         }

         // Check and remove from level_2
         const level2Index = crew.level_2.findIndex(member => member.userID === userID);
         if (level2Index > -1) {
            removedMember = crew.level_2[level2Index];
            crew.level_2.splice(level2Index, 1);
            memberRemoved = true;
         }

         // Check and remove from level_3
         const level3Index = crew.level_3.findIndex(member => member.userID === userID);
         if (level3Index > -1) {
            removedMember = crew.level_3[level3Index];
            crew.level_3.splice(level3Index, 1);
            memberRemoved = true;
         }

         // Update crew stats if member was removed
         if (memberRemoved && removedMember) {
            crew.totalMembers = Math.max(0, crew.totalMembers - 1);
            crew.totalCrewDeposits = Math.max(0, crew.totalCrewDeposits - removedMember.totalDeposits);
            crew.totalCrewWithdrawals = Math.max(0, crew.totalCrewWithdrawals - removedMember.totalWithdrawals);
            crew.totalCrewTransactions = Math.max(0, crew.totalCrewTransactions - removedMember.transactionCount);
            crew.lastUpdated = new Date();

            await crew.save();
            console.log(`    ✅ Removed ${username} from ${crew.ownerUsername}'s crew`);
         }
      }
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string[]} deletedUserIDs - Array of deleted user IDs
    * @function cleanupOrphanedReferences
    * @description Cleans up any remaining references to deleted users
    * @private
    */
   private async cleanupOrphanedReferences(deletedUserIDs: string[]) {
      console.log('🧹 Cleaning up orphaned references...');

      // Remove any remaining crew member references
      await this.crewModel.updateMany(
         {},
         {
            $pull: {
               level_1: { userID: { $in: deletedUserIDs } },
               level_2: { userID: { $in: deletedUserIDs } },
               level_3: { userID: { $in: deletedUserIDs } }
            }
         }
      );

      // Find and handle users who had referredBy pointing to deleted users
      const orphanedUsers = await this.userModel.find({
         referredBy: { $exists: true, $ne: null }
      });

      for (const user of orphanedUsers) {
         const referrerExists = await this.userModel.findOne({ referral_code: user.referredBy });
         if (!referrerExists) {
            user.referredBy = undefined;
            await user.save();
            console.log(`  ✅ Removed orphaned referral for ${user.username}`);
         }
      }

      console.log('✅ Cleanup completed');
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string} email - Email of the user to delete
    * @function deleteUserDeepByEmail
    * @description Deep deletion by email
    * @export
    */
   async deleteUserDeepByEmail(email: string) {
      const user = await this.userModel.findOne({ email });
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return this.deleteUser(user.userID);
   }

   /**
    * @author Miracle Boniface
    * @module CrewService
    * @param {string} userID - User ID to preview deletion
    * @function previewDeepDeletion
    * @description Preview what would be deleted without actually deleting
    * @export
    */
   async previewDeepDeletion(userID: string) {
      const user = await this.userModel.findOne({ userID });
      if (!user) {
         throw new NotFoundException('User not found');
      }

      const usersToDelete = await this.getAllDownlineUsers(userID);

      const preview = {
         rootUser: {
            userID: user.userID,
            username: user.username,
            email: user.email
         },
         totalUsersToDelete: usersToDelete.length,
         userHierarchy: usersToDelete.map(u => ({
            userID: u.userID,
            username: u.username,
            level: u.level,
            depth: u.level === 0 ? 'Root' : `Level ${u.level}`
         })),
         estimatedTransactionsToDelete: 0,
         estimatedCrewsToDelete: usersToDelete.length
      };

      // Count transactions
      for (const userInfo of usersToDelete) {
         const user = await this.userModel.findOne({ userID: userInfo.userID });
         if (user) {
            const txCount = await this.transactionModel.countDocuments({ email: user.email });
            preview.estimatedTransactionsToDelete += txCount;
         }
      }

      return preview;
   }
}