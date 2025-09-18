// WorldEdit Mod - Fixed Version
(function() {
    'use strict';
    
    // Check if PluginAPI is available
    if (typeof PluginAPI === 'undefined') {
        console.error('PluginAPI not loaded! Retrying in 1 second...');
        setTimeout(arguments.callee, 1000);
        return;
    }
    
    // Initialize mod metadata
    PluginAPI.meta.title("WorldEdit");
    PluginAPI.meta.credits("By radmanplays");
    PluginAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVR42mNgoAcw1xT4D8Jka25LVQNjkg2Bac4OlP9fGqFImgHImmHY00z0f4af3H+SDADZDNIc6SwJpjXkuP+THHggm5ENIckrMGeDbIZ5hWgDQJo709XhziYpOpFtJjnuKdaM7OwhYjMIkG0zpQAAtFpjWIvu2dwAAAAASUVORK5CYII=");
    PluginAPI.meta.description("Use //wand, //set and //walls in singleplayer worlds.");

    // Wait for LibCustomItems to load
    PluginAPI.addEventListener("lib:libcustomitems:loaded", () => {
        console.log("Registered worldedit custom items.");
        LibCustomItems.registerItem({
            tag: "worldedit:wand",
            base: "wooden_axe",
            name: "Wand",
            qty: 1,
            recipe: [
                "   ",
                " # ",
                "   "
            ],
            recipeLegend: {
                "#": {
                    "type": "item",
                    "id": "wooden_axe"
                }
            },
            onRightClickGround: `/*user, world, itemstack, blockpos*/
            const prefix = "§7[§4worldedit§7] ";
            var username = PluginAPI.util.str(user.getName());

            globalThis.pos2x = {}
            globalThis.pos2y = {}
            globalThis.pos2z = {}

            globalThis.pos2x[username] = blockpos.x
            globalThis.pos2y[username] = blockpos.y
            globalThis.pos2z[username] = blockpos.z
            console.log("rightclick: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z)
            // Send chat message to player
            user.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + "Pos #2 set to: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z)))
            return true;
            `,
            onLeftClickGround: `/*user, world, itemstack, blockpos*/
            const prefix = "§7[§4worldedit§7] ";
            var username = PluginAPI.util.str(user.getName());

            globalThis.posx = {}
            globalThis.posy = {}
            globalThis.posz = {}

            globalThis.posx[username] = blockpos.x
            globalThis.posy[username] = blockpos.y
            globalThis.posz[username] = blockpos.z
            
            // Send chat message to player
            user.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + "Pos #1 set to: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z)))
            return true;
            `
        });
    });

    // Server-side command handling
    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!PluginAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) {return}
            const prefix = "§7[§4worldedit§7] ";
            
            // //wand command
            if (event.command.toLowerCase().startsWith("//wand")) {
                // Create a new ItemStack for the custom item
                const ItemStackClass = PluginAPI.reflect.getClassById("net.minecraft.item.ItemStack");
                const itemStack = ItemStackClass.constructors[4](
                    PluginAPI.items["wooden_axe"].getRef(), 1
                );
                
                // Create NBT data for the item
                const NBTTagCompoundClass = PluginAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound");
                itemStack.$stackTagCompound = NBTTagCompoundClass.constructors[0]();
                const displayTag = NBTTagCompoundClass.constructors[0]();
                itemStack.$stackTagCompound.$setTag(PluginAPI.util.str("display"), displayTag);

                // Add the enchant effect to the item
                let enchant = PluginAPI.hooks._classMap.nme_Enchantment.staticMethods.getEnchantmentById.method(0);
                enchant.$effectId = -1;
                itemStack.$addEnchantment(enchant);

                // Set item name
                displayTag.$setString(PluginAPI.util.str("Name"), PluginAPI.util.str("Wand"));

                // Set item lore
                var loreList = PluginAPI.reflect.getClassById("net.minecraft.nbt.NBTTagList").constructors[0]();
                loreList.$appendTag(PluginAPI.reflect.getClassById("net.minecraft.nbt.NBTTagString").constructors.filter(x => { return x.length === 1 })[0](PluginAPI.util.str("worldedit:wand")));
                displayTag.$setTag(PluginAPI.util.str("Lore"), loreList);

                // Add the item to the sender's inventory
                const player = event.sender;
                player.inventory.addItemStackToInventory(itemStack);

                // Notify the sender
                const ChatComponentTextClass = PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                player.addChatMessage(ChatComponentTextClass.constructors[0](PluginAPI.util.str(prefix + "A wand has been added to your inventory!")));
                player.addChatMessage(ChatComponentTextClass.constructors[0](PluginAPI.util.str(prefix + "Left click: select pos #1; Right click: select pos #2")));
                
                event.preventDefault = true;
            }
            
            var blockPosConstructor = PluginAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find((x) => { return x.length === 3 });
            
            // //set command
            if (event.command.toLowerCase().startsWith("//set")) {
                const args = event.command.substring("//set ".length);
                var username = PluginAPI.util.str(event.sender.getName());
        
                if (args) {
                    const blockTypeName = args
                    const x1 = globalThis.posx[username], y1 = globalThis.posy[username], z1 = globalThis.posz[username];
                    const x2 = globalThis.pos2x[username], y2 = globalThis.pos2y[username], z2 = globalThis.pos2z[username];
        
                    // Validate block and get block type
                    const blockType = PluginAPI.blocks[blockTypeName];
                    if (!blockType) {
                        event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Invalid block: ${blockTypeName}`)));
                        event.preventDefault = true;
                        return;
                    }
                    const block = blockType.getDefaultState().getRef();
        
                    // Get min and max coordinates for the fill region
                    const xMin = Math.min(x1, x2), xMax = Math.max(x1, x2);
                    const yMin = Math.min(y1, y2), yMax = Math.max(y1, y2);
                    const zMin = Math.min(z1, z2), zMax = Math.max(z1, z2);
        
                    // Loop through the region and set the blocks
                    for (let x = xMin; x <= xMax; x++) {
                        for (let y = yMin; y <= yMax; y++) {
                            for (let z = zMin; z <= zMax; z++) {
                                const blockPos = blockPosConstructor(x, y, z);
                                event.sender.getServerForPlayer().setBlockState(blockPos, block, 3);
                            }
                        }
                    }
        
                    // Notify the player that the blocks have been set
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Set blocks to ${blockTypeName}`)));
                } else{
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Arguments not found!`)));
                }
                event.preventDefault = true;
            }
            
            // //walls command
            if (event.command.toLowerCase().startsWith("//walls")) {
                const args = event.command.substring("//walls ".length);
                var username = PluginAPI.util.str(event.sender.getName());

                if (args) {
                    const blockTypeName = args;
                    const x1 = globalThis.posx[username], y1 = globalThis.posy[username], z1 = globalThis.posz[username];
                    const x2 = globalThis.pos2x[username], y2 = globalThis.pos2y[username], z2 = globalThis.pos2z[username];

                    // Validate block and get block type
                    const blockType = PluginAPI.blocks[blockTypeName];
                    if (!blockType) {
                        event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Invalid block: ${blockTypeName}`)));
                        event.preventDefault = true;
                        return;
                    }
                    const block = blockType.getDefaultState().getRef();

                    // Get min and max coordinates for the region
                    const xMin = Math.min(x1, x2), xMax = Math.max(x1, x2);
                    const yMin = Math.min(y1, y2), yMax = Math.max(y1, y2);
                    const zMin = Math.min(z1, z2), zMax = Math.max(z1, z2);

                    // Loop through the region and set the walls (exclude interior blocks)
                    for (let x = xMin; x <= xMax; x++) {
                        for (let y = yMin; y <= yMax; y++) {
                            for (let z = zMin; z <= zMax; z++) {
                                if (x === xMin || x === xMax || z === zMin || z === zMax) {
                                    const blockPos = blockPosConstructor(x, y, z);
                                    event.sender.getServerForPlayer().setBlockState(blockPos, block, 3);
                                }
                            }
                        }
                    }

                    // Notify the player that the walls have been set
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Walls set to ${blockTypeName}`)));
                } else {
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Arguments not found!`)));
                }
                event.preventDefault = true;
            }
            
            // //replacenear command (made by EymenWSMC)
            if (event.command.toLowerCase().startsWith("//replacenear")) {
                const args = event.command.split(" ").slice(1); 
                if (args.length < 3) {
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + "Usage: //replacenear <radius> <targetBlock> <replacementBlock>")));
                    event.preventDefault = true;
                    return;
                }
        
                const radius = parseInt(args[0]);
                const targetBlockName = args[1];
                const replacementBlockName = args[2];
        
                const targetBlock = PluginAPI.blocks[targetBlockName];
                const replacementBlock = PluginAPI.blocks[replacementBlockName];
                if (!targetBlock || !replacementBlock) {
                    event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + "Invalid block names!")));
                    event.preventDefault = true;
                    return;
                }

                // Replacing logic
                const targetBlockState = targetBlock.getDefaultState().getRef();
                const replacementBlockState = replacementBlock.getDefaultState().getRef();
        
                const playerPos = event.sender.getPosition();
                const xStart = Math.floor(playerPos.x - radius);
                const xEnd = Math.floor(playerPos.x + radius);
                const yStart = Math.floor(playerPos.y - radius);
                const yEnd = Math.floor(playerPos.y + radius);
                const zStart = Math.floor(playerPos.z - radius);
                const zEnd = Math.floor(playerPos.z + radius);
        
                // Replace within radius
                for (let x = xStart; x <= xEnd; x++) {
                    for (let y = yStart; y <= yEnd; y++) {
                        for (let z = zStart; z <= zEnd; z++) {
                            const blockPos = blockPosConstructor(x, y, z);
                            const currentBlock = event.sender.getServerForPlayer().getBlockState(blockPos);
        
                            if (currentBlock.equals(targetBlockState)) {
                                event.sender.getServerForPlayer().setBlockState(blockPos, replacementBlockState, 3);
                            }
                        }
                    }
                }
        
                // Send confirmation message
                event.sender.addChatMessage(PluginAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](PluginAPI.util.str(prefix + `Replaced ${targetBlockName} with ${replacementBlockName} within radius ${radius}`)));
                event.preventDefault = true;
            }
        });
    });
})();
