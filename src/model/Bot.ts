import '../utils/module-alias';
import { Collection, Client, ActivityType, Message, Snowflake } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import config from '@src/utils/config';
import { MappingDirectories } from '@src/utils/mappingDirectories';
import { separateTrigger } from '@src/providers/commandsProvider';
import { SongQueue } from '@src/model/SongQueue';
import { iGroupData } from '@src/interfaces/iGroupData';

export class Bot {
    public commands = new Collection<string, iCommand>();
    public groups = new Collection<string, iGroupData>()
    public cooldown = new Collection<string, Collection<string, number>>();
    public queue = new Collection<Snowflake, SongQueue>()

    public constructor(public readonly client: Client) {
        this.client.login(config.general.TOKEN);
        this.client.user?.setAvatar('http://pm1.narvii.com/7613/ab57b8bb348c4c57901780afc219620136fbe953r1-346-346v2_00.jpg');

        this.client.on('ready', () => {
            console.log(`${this.client.user?.username} ready!`);
            this.client.user?.setActivity(`${config.general.TRIGGER}help`, { type: ActivityType.Listening });
        });

        this.client.on('error', console.error);
        this.client.on('warn', (info) => console.log(info));

        this.importCommands();
        this.onMessage();
    }

    private async importCommands(): Promise<void> {
        type CommandImport = typeof import('@src/commands/general/help');
        const path = MappingDirectories.pathResolve('src/commands');
        const commandFiles = MappingDirectories.filesResolve(path);

        for (const file of commandFiles) {
            const command: CommandImport = await import(MappingDirectories.pathResolve(path, file));
            if (command.default.active) {
                this.commands.set(command.default.name, command.default);
                this.groups.set(command.default.group.toLowerCase(), { commandName: command.default.name, groupName: command.default.group });
            }
        }
    }

    private async onMessage(): Promise<void> {
        this.client.on('messageCreate', async (message: Message) => {
            if (message.author.bot) return;
            if (!message.content.startsWith(config.general.TRIGGER)) return;

            const content = separateTrigger(message.content);
            if (!content) return;

            const command = this.commands.get(content.command) ?? this.commands.find((cmd) => cmd.aliases?.includes(content.command));
            if (!command) return;
            if (command.active) await command.execute(message, content.args);
        })
    }
}