import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface NumberNamesSettings {
	folderName: string;
	fileNames: string[]
}

const DEFAULT_SETTINGS: NumberNamesSettings = {
	folderName: 'Messy',
	fileNames: ['num', 'number']
}

export default class NumberNamesPlugin extends Plugin {
	settings: NumberNamesSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));
	

		this.app.workspace.onLayoutReady(() => {
			this.app.vault.on('rename', file => {
				const folderName = 'Messy'
				if (file.parent?.path !== folderName) {
					return
				}

				const allowedNames = ['num.md', 'number.md']
				if (!allowedNames.some(f => f === file.name.toLowerCase())) {
					return
				}

				const biggestNumber = file.parent.children
					.map(f => parseInt(f.name))
					.filter(f => !isNaN(f))
					.reduce((a, b) => Math.max(a, b))
				
				const fileNumber = biggestNumber + 1
				const newPath = `${folderName}/${fileNumber}.md`

				new Notice('File was automatically renamed to ' + fileNumber)
				this.app.vault.rename(file, newPath)
			})
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: NumberNamesPlugin;

	constructor(app: App, plugin: NumberNamesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Folder name')
			.setDesc('The name of the folder you want to auto name')
			.addText(text => text
				.setPlaceholder('Enter the name')
				.setValue(this.plugin.settings.folderName)
				.onChange(async (value) => {
					this.plugin.settings.folderName = value;
					await this.plugin.saveSettings();
				}));
	}
}
