// LibCustomItems - Custom Item Library
// This should be loaded BEFORE your WorldEdit mod

(function waitForModAPI() {
    'use strict';

    if (typeof ModAPI === 'undefined') {
        setTimeout(waitForModAPI, 100); // ✅ Now this works even in strict mode
        return;
    }
    
    // Initialize LibCustomItems
    window.LibCustomItems = {
        registeredItems: {},
        
        registerItem: function(itemConfig) {
            if (!itemConfig || !itemConfig.tag) {
                console.error("LibCustomItems: Invalid item config");
                return;
            }
            
            console.log("LibCustomItems: Registering item " + itemConfig.tag);
            
            // Store the item configuration
            this.registeredItems[itemConfig.tag] = itemConfig;
            
            // Register click handlers if provided
            if (itemConfig.onRightClickGround) {
                this.registerRightClickHandler(itemConfig.tag, itemConfig.onRightClickGround);
            }
            
            if (itemConfig.onLeftClickGround) {
                this.registerLeftClickHandler(itemConfig.tag, itemConfig.onLeftClickGround);
            }
            
            console.log("LibCustomItems: Successfully registered " + itemConfig.tag);
        },
        
        registerRightClickHandler: function(itemTag, handlerCode) {
            // This would normally hook into the game's right-click event system
            // For now, we'll store the handler
            if (!this.registeredItems[itemTag]) {
                this.registeredItems[itemTag] = {};
            }
            this.registeredItems[itemTag].onRightClickGround = handlerCode;
        },
        
        registerLeftClickHandler: function(itemTag, handlerCode) {
            // This would normally hook into the game's left-click event system
            // For now, we'll store the handler
            if (!this.registeredItems[itemTag]) {
                this.registeredItems[itemTag] = {};
            }
            this.registeredItems[itemTag].onLeftClickGround = handlerCode;
        },
        
        getItem: function(tag) {
            return this.registeredItems[tag];
        }
    };
    
    // Hook into the item click events (this is a simplified version)
    // In a real implementation, this would integrate with the game's event system
    ModAPI.addEventListener("item:rightclick", function(event) {
        // Check if the item has a custom handler
        var itemStack = event.itemStack;
        if (itemStack && itemStack.$stackTagCompound) {
            var lore = itemStack.$stackTagCompound.$getTagList(ModAPI.util.str("display"), 10);
            if (lore && lore.$tagCount() > 0) {
                var loreTag = lore.$getStringTagAt(0);
                var itemTag = ModAPI.util.str(loreTag);
                
                var customItem = LibCustomItems.getItem(itemTag);
                if (customItem && customItem.onRightClickGround) {
                    // Execute the custom handler
                    try {
                        var handler = new Function('user', 'world', 'itemstack', 'blockpos', customItem.onRightClickGround);
                        var result = handler(event.user, event.world, event.itemStack, event.blockPos);
                        if (result) {
                            event.preventDefault = true;
                        }
                    } catch (e) {
                        console.error("LibCustomItems: Error executing right-click handler", e);
                    }
                }
            }
        }
    });
    
    ModAPI.addEventListener("item:leftclick", function(event) {
        // Similar to right-click handler
        var itemStack = event.itemStack;
        if (itemStack && itemStack.$stackTagCompound) {
            var lore = itemStack.$stackTagCompound.$getTagList(ModAPI.util.str("display"), 10);
            if (lore && lore.$tagCount() > 0) {
                var loreTag = lore.$getStringTagAt(0);
                var itemTag = ModAPI.util.str(loreTag);
                
                var customItem = LibCustomItems.getItem(itemTag);
                if (customItem && customItem.onLeftClickGround) {
                    // Execute the custom handler
                    try {
                        var handler = new Function('user', 'world', 'itemstack', 'blockpos', customItem.onLeftClickGround);
                        var result = handler(event.user, event.world, event.itemStack, event.blockPos);
                        if (result) {
                            event.preventDefault = true;
                        }
                    } catch (e) {
                        console.error("LibCustomItems: Error executing left-click handler", e);
                    }
                }
            }
        }
    });
    
    // Fire the loaded event
    setTimeout(function() {
        ModAPI.addEventListener("lib:libcustomitems:loaded", function() {});
        var event = new CustomEvent("lib:libcustomitems:loaded");
        ModAPI.dispatchEvent(event);
        console.log("LibCustomItems: Library loaded and ready");
    }, 100);
    
})();
